import React from "react";
import "./Checkers.css";
import Board from "./components/Board";
import socketService from "./services/socket-service";

const BOARD_SIZE = 8;

/**
 * Checkers.
 *
 * @export
 * @class Checkers
 * @extends {React.Component}
 */
export default class CheckersComponent extends React.Component {
    board = [];
    checkers = new Map();
    activeTurn = "white";
    currentPlayer = "black";

    constructor() {
        super();
        this.onDrop = this.onDrop.bind(this);
        this.update = this.update.bind(this);
        const user = "Will";
        socketService.connect(user);
    }

    setCheckers(checkers, playerColor = "white") {
        const { whiteCheckers, blackCheckers } = checkers;
        whiteCheckers &&
            whiteCheckers.forEach(index => {
                this.checkers.set(index, {
                    checkerColor: "white",
                    checkerType: "checker"
                });
            });
        blackCheckers &&
            blackCheckers.forEach(index => {
                this.checkers.set(index, {
                    checkerColor: "black",
                    checkerType: "checker"
                });
            });
        this.setState({ checkers: this.checkers });
    }

    componentDidMount() {
        this.setState({ checkers: {} });

        const upperColor =
            this.currentPlayer === "white" ? "whiteCheckers" : "blackCheckers";
        const lowerColor =
            this.currentPlayer === "black" ? "whiteCheckers" : "blackCheckers";
        this.setCheckers({
            [upperColor]: [41, 43, 45, 47, 48, 50, 52, 54, 57, 59, 61, 63],
            [lowerColor]: [0, 2, 4, 6, 9, 11, 13, 15, 16, 18, 20, 22]
        });
    }

    onDragStart(draggedChecker, event) {
        event.dataTransfer.setData(
            "draggedChecker",
            JSON.stringify(draggedChecker)
        );
    }

    onDrop(event) {
        let draggedChecker = JSON.parse(
            event.dataTransfer.getData("draggedChecker")
        );
        let currCellIndex = event.target.getAttribute("tag")
            ? parseInt(event.target.getAttribute("tag"))
            : null;
        let currCellRow = event.target.getAttribute("row")
            ? parseInt(event.target.getAttribute("row"))
            : null;
        let currCellColumn = event.target.getAttribute("row")
            ? parseInt(event.target.getAttribute("column"))
            : null;

        if (
            draggedChecker &&
            draggedChecker.checkerColor === this.activeTurn &&
            currCellIndex !== null &&
            currCellColumn !== null &&
            currCellRow !== null
        ) {
            const result = this.checkMove(
                draggedChecker,
                this.board[currCellRow][currCellColumn]
            );
            if (result.status === "pass") {
                this.checkers.delete(draggedChecker.index);
                this.checkers.set(currCellIndex, {
                    checkerColor: draggedChecker.checkerColor,
                    checkerType: result.isKing ? "king" : "checker"
                });

                this.setState({ checkers: this.checkers });
                this.activeTurn =
                    this.activeTurn === "white" ? "black" : "white";
                result.eatenIndex && this.checkers.delete(result.eatenIndex);
            }
        }
    }

    checkMove(draggedChecker, targetCell) {
        let ret = { status: "pass" };
        if (targetCell.color === "light") {
            ret = { status: "fail" };
        } else {
            let diffCols = Math.abs(draggedChecker.column - targetCell.column);
            let diffRows = Math.abs(draggedChecker.row - targetCell.row);
            const movingBackward =
                draggedChecker.checkerColor === "black"
                    ? draggedChecker.row > targetCell.row
                    : draggedChecker.row < targetCell.row;

            const isEnemyAt = midIndex => {
                return draggedChecker.checkerColor === "black"
                    ? this.checkers.get(midIndex)?.checkerColor === "white"
                    : this.checkers.get(midIndex)?.checkerColor === "black";
            };

            const isKingColumn =
                draggedChecker.checkerColor === "black"
                    ? targetCell.row === BOARD_SIZE - 1
                    : targetCell.row === 0;

            if (
                (draggedChecker.checkerType === "checker" && movingBackward) ||
                (draggedChecker.checkerType === "checker" && diffCols > 2) ||
                diffCols !== diffRows
            ) {
                ret = { status: "fail" };
            } else {
                if (diffCols === 2) {
                    const midColumn =
                        draggedChecker.column > targetCell.column
                            ? draggedChecker.column - 1
                            : targetCell.column - 1;

                    const midRow =
                        draggedChecker.row > targetCell.row
                            ? draggedChecker.row - 1
                            : targetCell.row - 1;
                    const midIndex = midRow * BOARD_SIZE + midColumn;
                    if (isEnemyAt(midIndex)) {
                        ret = { status: "pass", eatenIndex: midIndex };
                    } else {
                        ret = { status: "fail" };
                    }
                } else {
                    if (this.checkers[targetCell.index]) {
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
            }
        }
        return ret;
    }

    update(checkers, activeTurn) {
        this.checkers = checkers;
        this.activeTurn = activeTurn;
        this.setState({ checkers: checkers });
    }

    render() {
        return (
            <div className="container">
                {/* <div className="header" /> */}

                <div className="main">
                    <Board
                        activeTurn={this.activeTurn}
                        boardSize={BOARD_SIZE}
                        board={this.board}
                        checkers={this.checkers}
                        onDragStart={this.onDragStart}
                        callback={this.update}
                        currentPlayer={this.currentPlayer}
                        // onDrop={this.onDrop}
                    />
                </div>
                {/* <div className="footer">Ready</div> */}
            </div>
        );
    }
}
