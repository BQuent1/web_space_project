export const getAsteroidTresPosition = (ephemeris, currentDateMs) => {
    if (!ephemeris || ephemeris.length === 0) return null;
  
    let p1 = ephemeris[0];
    let p2 = ephemeris[ephemeris.length - 1];
  
    if (currentDateMs <= p1.timestamp) {
      p2 = p1;
    } else if (currentDateMs >= p2.timestamp) {
      p1 = p2;
    } else {
      for (let i = 0; i < ephemeris.length - 1; i++) {
        if (currentDateMs >= ephemeris[i].timestamp && currentDateMs <= ephemeris[i+1].timestamp) {
          p1 = ephemeris[i];
          p2 = ephemeris[i+1];
          break;
        }
      }
    }
  
    let ratio = 0;
    if (p2.timestamp !== p1.timestamp) {
      ratio = (currentDateMs - p1.timestamp) / (p2.timestamp - p1.timestamp);
    }
  
    const exactX_km = p1.x + (p2.x - p1.x) * ratio;
    const exactY_km = p1.y + (p2.y - p1.y) * ratio;
    const exactZ_km = p1.z + (p2.z - p1.z) * ratio;
  
    const SCALE_UNIT = 100000;
    const tresX = exactX_km / SCALE_UNIT;
    const tresY = exactZ_km / SCALE_UNIT;
    const tresZ = -exactY_km / SCALE_UNIT;
  
    return { x: tresX, y: tresY, z: tresZ };
  }
