import React from "react";
const King = ({ cell, checkerColor, checkerType, onDragStart }) => {
    let checkerClass = "circle";
    if (checkerColor === "black") {
        checkerClass += " dark-circle king";
    } else {
        checkerClass += " light-circle king";
    }

    const checkMove = targetCell => {
        return false;
    };

    return (
        <div
            draggable
            className={checkerClass}
            tag={cell.index}
            onDragStart={event =>
                onDragStart(
                    {
                        ...cell,
                        checkerColor,
                        checkerType,
                        checkMove
                    },
                    event
                )
            }
            onDragOver={event => event.preventDefault()}
            onDrop={event => event.preventDefault()}
        />
    );
};
export default King;
