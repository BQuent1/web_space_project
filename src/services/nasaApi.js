const API_KEY = 'nN3wCQcOohEwA8xbWD00dTSOSSJ6EbWRHQS1u0aF';
const BASE_URL = 'https://api.nasa.gov/neo/rest/v1';

export const nasaService = {
  async getAsteroids() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const chaine = `${BASE_URL}/feed?start_date=2026-01-30&api_key=${API_KEY}`;

      console.log(chaine);

      const response = await fetch(chaine);
      const data = await response.json();


      const rawAsteroids = data.near_earth_objects[today];

      return rawAsteroids.map(asteroid => ({
        id: asteroid.id,
        name: asteroid.name.replace('(', '').replace(')', ''),
        size: asteroid.estimated_diameter.meters.estimated_diameter_max,
        velocity: asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour,
        distance: asteroid.close_approach_data[0].miss_distance.kilometers,
        isDangerous: asteroid.is_potentially_hazardous_asteroid,
      }));
    } catch (error) { 
      console.error("Erreur lors de la récupération des astéroïdes:", error);
      return []
    }
  }
}
