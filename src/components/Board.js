import React, { useEffect } from "react";
import Opponent from "./Opponent";
import CheckerFactory from "./CheckerFactory";

const Board = ({
    activeTurn,
    boardSize,
    board,
    checkers,
    callback: redrawBoard,
    currentPlayer
}) => {
    useEffect(() => {
        initBoard();
    }, []);

    const onDragStart = (draggedChecker, event) => {
        event.dataTransfer.setData(
            "draggedChecker",
            JSON.stringify(draggedChecker)
        );
    };

    const getPosition = (event) => {
        let currCellIndex = event.target.getAttribute("tag")
            ? parseInt(event.target.getAttribute("tag"))
            : null;
        let currCellRow = event.target.getAttribute("row")
            ? parseInt(event.target.getAttribute("row"))
            : null;
        let currCellColumn = event.target.getAttribute("row")
            ? parseInt(event.target.getAttribute("column"))
            : null;

        return { currCellIndex, currCellRow, currCellColumn };
    }

    const assertPosition = (position) => {
        const { currCellColumn, currCellIndex, currCellRow } = position;
        if (!currCellIndex || !currCellRow || !currCellColumn) {
            throw new Error("Invalid position");
        }
    };

    const assertDraggedChecker = (draggedChecker) => {
        if (!draggedChecker) {
            throw new Error("No checker is selected to drag");
        }
    }

    const assertInvalidTurn = (draggedChecker) => {
        if (draggedChecker.checkerColor !== activeTurn) {
            throw new Error("Tried to move checker not in turn");
        }
    }

    const onDrop = event => {
        try {
            let draggedChecker = JSON.parse(
                event.dataTransfer.getData("draggedChecker")
            );
            assertDraggedChecker(draggedChecker);
            const position = getPosition(event);

            assertPosition(position);
            const { currCellColumn, currCellIndex, currCellRow } = position;

            let moveResult = {};

            moveResult = checkMove(
                draggedChecker,
                board[currCellRow][currCellColumn]
            );

            console.debug(`${draggedChecker.checkerColor} : 
                [${draggedChecker.row},${draggedChecker.column}] => [${currCellRow},${currCellColumn}]`);

            makeMove(draggedChecker, currCellIndex, moveResult);
            flipTurn();
            redrawBoard(checkers, activeTurn);

        } catch (err) {
            console.log(err);
        }
    };

    const makeMove = (draggedChecker, currCellIndex, moveResult) => {
        checkers.delete(draggedChecker.index);
        checkers.set(currCellIndex, {
            checkerColor: draggedChecker.checkerColor,
            checkerType: moveResult.isKing ? "king" : "checker"
        });
        moveResult.eatenIndex && checkers.delete(moveResult.eatenIndex);
    }

    const flipTurn = () => {
        activeTurn = activeTurn === "white" ? "black" : "white";
        console.debug(`Turn is flipped. New turn is : ${activeTurn}`);
    }

    const isMovingBackward = (draggedChecker, targetCell) => {
        const movingBackward =
            (draggedChecker.checkerColor === "black" &&
                currentPlayer === "white") ||
                (draggedChecker.checkerColor === "white" &&
                    currentPlayer === "black")
                ? draggedChecker.row > targetCell.row
                : draggedChecker.row < targetCell.row;
        return movingBackward;
    };

    const isEnemyAt = (draggedChecker, index) => {
        return draggedChecker.checkerColor === "black"
            ? checkers.get(index)?.checkerColor === "white"
            : checkers.get(index)?.checkerColor === "black";
    };

    const isFriendAt = (draggedChecker, index) => {
        return draggedChecker.checkerColor === "white"
            ? checkers.get(index)?.checkerColor === "white"
            : checkers.get(index)?.checkerColor === "black";
    };

    const hasBecameKing = (draggedChecker, targetCell) => {
        return (draggedChecker.checkerColor === "black" &&
            currentPlayer === "white") ||
            (draggedChecker.checkerColor === "white" &&
                currentPlayer === "black")
            ? targetCell.row === boardSize - 1
            : targetCell.row === 0;
    };

    const assertIllegalCellColor = targetCell => {
        if (targetCell.color === "light") {
            throw new Error("Attept to move to light cell");
        }
    };

    const assertIllegalCell = () => { };

    const getCellDiff = (draggedChecker, targetCell) => {
        let diffCols = Math.abs(draggedChecker.column - targetCell.column);
        let diffRows = Math.abs(draggedChecker.row - targetCell.row);

        if (diffCols === diffRows) {
            return diffCols;
        }
        throw new Error("Illegal move");
    };

    const getPossibleMoves = (targetCell, exceptionCells) => {
        return 0;
    };

    const getMidCell = (draggedChecker, targetCell) => {
        return 0;
    };

    const checkCheckerMove = (draggedChecker, targetCell) => {
        const movingForward = !isMovingBackward(draggedChecker, targetCell);
        const cellDiff = getCellDiff(draggedChecker, targetCell);
        const isFriendAtTargetCell = isFriendAt(targetCell, targetCell);

        let ret =
            (cellDiff === 1 && movingForward && !isFriendAtTargetCell) ||
            //Instead of 0 - find the mid cell
            (cellDiff === 2 &&
                isEnemyAt(
                    draggedChecker,
                    getMidCell(draggedChecker, targetCell)
                ));
        if (ret) {
            //get all options from targetCell except draggedChecker origin cell
            const nextMoves = getPossibleMoves(targetCell, targetCell);
            ret = { status: "pass" };
            if (nextMoves) {
                ret = { ...ret, nextMoves };
            }
        }

        throw new Error("Invalid move");
    };

    const checkKingMove = (draggedChecker, targetCell) => {
        const movingForward = !isMovingBackward(draggedChecker, targetCell);
        const cellDiff = getCellDiff(draggedChecker, targetCell);
        const isFriendAtTargetCell = isFriendAt(targetCell, targetCell);

        let ret =
            (cellDiff === 1 && movingForward && !isFriendAtTargetCell) ||
            //Instead of 0 - find the mid cell
            (cellDiff === 2 &&
                isEnemyAt(
                    draggedChecker,
                    getMidCell(draggedChecker, targetCell)
                ));
        if (ret) {
            //get all options from targetCell except draggedChecker origin cell
            const nextMoves = getPossibleMoves(targetCell, targetCell);
            ret = { status: "pass" };
            if (nextMoves) {
                ret = { ...ret, nextMoves };
            }
        }

        throw new Error("Invalid move");
    };

    const checkMove2 = (draggedChecker, targetCell) => {
        let ret = null;

        assertIllegalCellColor(targetCell);
        assertIllegalCell(targetCell);

        draggedChecker.checkerType === "checker"
            ? (ret = checkCheckerMove(draggedChecker, targetCell))
            : (ret = checkKingMove(draggedChecker, targetCell));

        return ret;
    };

    const assertCheckerMovingBackward = (draggedChecker, targetCell) => {
        const movingBackward = isMovingBackward(draggedChecker, targetCell);
        if (draggedChecker.checkerType === "checker" && movingBackward) {
            throw new Error("Attempt to move checker backward");
        }
    }

    const assertCheckerIncorrectPositionMove = (draggedChecker, targetCell, diffRows, diffCols) => {

        if ((draggedChecker.checkerType === "checker") && diffCols >= 2 ||
            diffCols !== diffRows) {
            throw new Error("Attempt to move checker incorrect");
        }
    }

    const checkMove = (draggedChecker, targetCell) => {
        let ret = { status: "pass" };

        assertIllegalCell(targetCell);
        assertInvalidTurn(draggedChecker);
        assertIllegalCellColor(targetCell);

        let diffCols = Math.abs(draggedChecker.column - targetCell.column);
        let diffRows = Math.abs(draggedChecker.row - targetCell.row);

        const movingBackward = isMovingBackward(draggedChecker, targetCell);
        const isKingColumn = hasBecameKing(draggedChecker, targetCell);

        assertCheckerMovingBackward(draggedChecker, targetCell);
        assertCheckerIncorrectPositionMove(draggedChecker, targetCell, diffRows, diffCols);

        if (diffCols === 2) {
            const midColumn =
                draggedChecker.column > targetCell.column
                    ? draggedChecker.column - 1
                    : targetCell.column - 1;

            const midRow =
                draggedChecker.row > targetCell.row
                    ? draggedChecker.row - 1
                    : targetCell.row - 1;
            const midIndex = midRow * boardSize + midColumn;
            if (isEnemyAt(draggedChecker, midIndex)) {
                ret = { status: "pass", eatenIndex: midIndex };
            } else {
                ret = { status: "fail" };
            }
        } else {
            if (checkers[targetCell.index]) {
                ret = { status: "fail" };
            }
        }
        if (movingBackward) {
            //Find the crossed checkers
        }
        if (
            draggedChecker.checkerType === "king" ||
            (ret.status === "pass" && isKingColumn)
        ) {
            ret.isKing = true;
        }

        return ret;
    };

    const initBoard = () => {
        let color = false;
        for (let i = 0; i < boardSize; ++i) {
            let line = [];
            for (let j = 0; j < boardSize; ++j) {
                line.push({
                    row: i,
                    column: j,
                    color: color ? "light" : "dark",
                    index: i * boardSize + j
                });
                color = !color;
            }
            color = !color;
            board.push(line);
        }
    };

    const drawRow = line => {
        return line.map((cell, key) => {
            return (
                <div
                    key={key}
                    className={"cell " + cell.color}
                    tag={cell.index}
                    row={cell.row}
                    column={cell.column}
                    onDrop={onDrop}
                    onDragOver={event => event.preventDefault()}
                >
                    {checkers.get(cell.index) ? (
                        <CheckerFactory
                            key={cell.index}
                            cell={cell}
                            checkerColor={
                                checkers.get(cell.index)?.checkerColor
                            }
                            checkerType={checkers.get(cell.index)?.checkerType}
                            onDragStart={onDragStart}
                        />
                    ) : 1 !== 1 ? (
                        cell.index
                    ) : (
                                ""
                            )}
                </div>
            );
        });
    };

    return (
        <div className="board">
            <Opponent name={"Opponent 1"} />
            {board.map((line, index) => {
                return <div key={index} className="row">{drawRow(line)}</div>;
            })}
            <Opponent name={"Opponent 2"} />
        </div>
    );
};
export default Board;
