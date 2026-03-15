declare module "@mapbox/leaflet-omnivore" {
  import type { Layer } from "leaflet";
  function kml(url: string, options?: object, customLayer?: Layer): Layer;
  function gpx(url: string, options?: object, customLayer?: Layer): Layer;
  function geojson(url: string, options?: object, customLayer?: Layer): Layer;
  export default { kml, gpx, geojson };
}
