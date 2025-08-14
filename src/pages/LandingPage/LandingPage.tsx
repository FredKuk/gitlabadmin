import React, { JSX } from "react";
import "./style.scss";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { BoardPage } from "../Board/BoardPage";
import { LicencePage } from "../License/LicensePage";
import { UserPage } from "../User/UserPage";
import { GroupPage } from "../Group/GroupPage";
import { TeamPage } from "../Team/TeamPage";
import { PipelinePage } from "../Pipeline/PipelinePage";
import { RunnerPage } from "../Runner/RunnerPage";

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
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (menu: string) => {
    const path = `/${menu.toLowerCase()}`;
    if (location.pathname === path) {
      // 같은 페이지면 강제 리로드
      window.location.reload();
    } else {
      navigate(path);
    }
  };

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
                    onClick={handleMenuClick}
                    active={location.pathname === `/${menu.toLowerCase()}`}
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
              <Routes>
                <Route
                  path="/"
                  element={
                    <img className="image" alt="logo" src="/image/banner.png" />
                  }
                />
                <Route path="/board" element={<BoardPage />} />
                <Route path="/licence" element={<LicencePage />} />
                <Route path="/user" element={<UserPage />} />
                <Route path="/group" element={<GroupPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/pipeline" element={<PipelinePage />} />
                <Route path="/runner" element={<RunnerPage />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
