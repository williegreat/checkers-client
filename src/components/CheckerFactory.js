import React from "react";
import Checker from "./Checker";
import King from "./King";

const CheckerFactory = props => {
    return props.checkerType === "king" ? (
        <King {...props} />
    ) : (
        <Checker {...props} />
    );
};
export default CheckerFactory;
