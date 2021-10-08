import type { MultiFn2O } from "@thi.ng/defmulti";
import { defmulti } from "@thi.ng/defmulti/defmulti";
import type { IShape, SubdivKernel } from "@thi.ng/geom-api";
import { subdivide } from "@thi.ng/geom-subdiv-curve/subdivide";
import { Polygon } from "./api/polygon";
import { Polyline } from "./api/polyline";
import { copyAttribs } from "./internal/copy-attribs";
import { dispatch } from "./internal/dispatch";

export const subdivCurve: MultiFn2O<IShape, SubdivKernel, number, IShape> =
    defmulti<any, SubdivKernel, number | undefined, IShape>(
        dispatch,
        {},
        {
            poly: ($: Polygon, kernel, iter = 1) =>
                new Polygon(subdivide($.points, kernel, iter), copyAttribs($)),

            polyline: ($: Polyline, kernel, iter = 1) =>
                new Polyline(subdivide($.points, kernel, iter), copyAttribs($)),
        }
    );