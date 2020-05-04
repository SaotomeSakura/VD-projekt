import { select, json} from 'd3';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

json('https://observablehq.com/@d3/world-map-svg').then()