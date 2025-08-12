import React, { JSX, useState } from "react";
import "./style.scss";
import { CenterContent } from "./CenterContent";

type MainProps = {
  text: string;
  onClick: (text: string) => void;
  active: boolean;
};

const Main = ({ text, onClick, active }: MainProps) => {
  return (
    <div
      className={`main-menu-item${active ? " active" : ""}`}
      onClick={() => onClick(text)}
    >
      {text}
    </div>
  );
};

const menuList = [
  "BOARD",
  "LICENCE",
  "USER",
  "GROUP",
  "TEAM",
  "PIPELINE",
  "RUNNER",
];

export const LandingPage = (): JSX.Element => {
  const [selected, setSelected] = useState("");

  return (
    <div className="landing-page">
      <div className="overlap-group-wrapper">
        <div className="overlap-group">
          <div className="navigation">
            <div className="nav-left">
              <button className="button">
                <div className="div">SYNC</div>
              </button>
            </div>
            <div className="nav-center">
              <div className="items">
                {menuList.map((menu) => (
                  <Main
                    key={menu}
                    text={menu}
                    onClick={setSelected}
                    active={selected === menu}
                  />
                ))}
              </div>
            </div>
            <div className="nav-right">
              <div className="text-wrapper-2">마지막 동기화</div>
              <div className="text-wrapper-3">2025.05.01 01:01:01</div>
            </div>
          </div>
          <div className="center-area">
            <div className="banner-wrapper">
              <CenterContent selected={selected} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
