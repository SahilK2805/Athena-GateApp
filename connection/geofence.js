function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const toRadians = degrees => degrees * Math.PI / 180;

    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    const a = Math.sin(deltaPhi / 2) ** 2 +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) ** 2;
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

function isWithinGeofence(userLat, userLon, deviceLat, deviceLon, minDistance = 0, maxDistance = 500) {
    const distance = haversine(userLat, userLon, deviceLat, deviceLon);
    return minDistance <= distance && distance <= maxDistance;
}

// Example usage

export default isWithinGeofence;    