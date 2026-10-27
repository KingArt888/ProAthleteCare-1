/* Test providers, not a production hosting commitment. No keys. Switch these
 * endpoints without touching GPS tracking/replay. See MAP_PROVIDER_POLICY.md. */
window.PACMapProviders=Object.freeze({
  tileUrl:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileMaxZoom:19,
  geocoderUrl:'https://photon.komoot.io/api/',
  searchIntervalMs:1500,
  searchTimeoutMs:8000
});
