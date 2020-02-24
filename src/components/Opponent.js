import React from "react";
const Opponent = ({ name }) => {
    return (
        <div className="opponent">
            <div className="opponent-name">
                <img
                    style={{ width: "40px", height: "40px" }}
                    src="/avatar.jpeg"
                />
                {name}
            </div>
            <div className="opponent-time">10:00</div>
        </div>
    );
};
export default Opponent;
