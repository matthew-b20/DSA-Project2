// this makes it so Typescript doesn't get mad at the existence of geojson:
declare module '*.geojson' {
    const value: any;
    export default value;
}