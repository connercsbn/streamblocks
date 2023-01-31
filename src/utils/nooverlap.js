"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
import overlapfunction from "./overlap.js";

export default function nooverlap(args) {
  return overlapfunction(args, true);
}
