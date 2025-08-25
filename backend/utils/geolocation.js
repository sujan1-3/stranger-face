// Geolocation utility for IP-based location detection
const axios = require('axios');

// Country flag mapping
const countryFlags = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵',
    'KR': '🇰🇷', 'IN': '🇮🇳', 'BR': '🇧🇷', 'CA': '🇨🇦', 'AU': '🇦🇺',
    'CN': '🇨🇳', 'RU': '🇷🇺', 'IT': '🇮🇹', 'ES': '🇪🇸', 'MX': '🇲🇽',
    'AR': '🇦🇷', 'EG': '🇪🇬', 'ZA': '🇿🇦', 'NG': '🇳🇬', 'TR': '🇹🇷'
};

/**
 * Get location information from IP address
 * Uses multiple free geolocation APIs as fallbacks
 */
async function getLocationFromIP(ip) {
    // For localhost/development, return mock data
    if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1' || !ip) {
        return {
            country: 'United States',
            countryCode: 'US',
            flag: '🇺🇸',
            city: 'New York',
            region: 'NY'
        };
    }

    const apis = [
        // Primary: ip-api.com (free, no API key required)
        {
            name: 'ip-api',
            url: `http://ip-api.com/json/${ip}?fields=country,countryCode,region,city,status`,
            parser: (data) => ({
                country: data.country,
                countryCode: data.countryCode,
                flag: countryFlags[data.countryCode] || '🌍',
                city: data.city,
                region: data.region
            })
        },
        // Fallback 1: ipapi.co (free tier available)
        {
            name: 'ipapi',
            url: `https://ipapi.co/${ip}/json/`,
            parser: (data) => ({
                country: data.country_name,
                countryCode: data.country_code,
                flag: countryFlags[data.country_code] || '🌍',
                city: data.city,
                region: data.region
            })
        },
        // Fallback 2: freeipapi.com
        {
            name: 'freeipapi',
            url: `https://free.freeipapi.com/api/json/${ip}`,
            parser: (data) => ({
                country: data.countryName,
                countryCode: data.countryCode,
                flag: countryFlags[data.countryCode] || '🌍',
                city: data.cityName,
                region: data.regionName
            })
        }
    ];

    for (const api of apis) {
        try {
            console.log(`Trying ${api.name} for IP: ${ip}`);

            const response = await axios.get(api.url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Stranger-Face/1.0'
                }
            });

            const locationData = api.parser(response.data);

            // Validate required fields
            if (locationData.country && locationData.countryCode) {
                console.log(`Successfully got location from ${api.name}:`, locationData);
                return locationData;
            }
        } catch (error) {
            console.warn(`Failed to get location from ${api.name}:`, error.message);
            continue;
        }
    }

    // Final fallback - return default location
    console.warn(`All geolocation APIs failed for IP: ${ip}, using default`);
    return {
        country: 'Unknown',
        countryCode: 'XX',
        flag: '🌍',
        city: 'Unknown',
        region: 'Unknown'
    };
}

/**
 * Get location with caching (in production, use Redis or similar)
 */
const locationCache = new Map();

async function getCachedLocationFromIP(ip) {
    // Check cache first (cache for 1 hour)
    const cached = locationCache.get(ip);
    if (cached && Date.now() - cached.timestamp < 3600000) {
        return cached.data;
    }

    // Get fresh data
    const locationData = await getLocationFromIP(ip);

    // Cache the result
    locationCache.set(ip, {
        data: locationData,
        timestamp: Date.now()
    });

    return locationData;
}

// Clean up cache periodically (every hour)
setInterval(() => {
    const now = Date.now();
    for (const [ip, cached] of locationCache.entries()) {
        if (now - cached.timestamp > 3600000) {
            locationCache.delete(ip);
        }
    }
}, 3600000);

module.exports = {
    getLocationFromIP,
    getCachedLocationFromIP: getCachedLocationFromIP
};
