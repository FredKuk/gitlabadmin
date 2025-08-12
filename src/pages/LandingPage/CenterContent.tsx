import React from "react";
import { BoardPage } from "../Board/BoardPage";
import { LicencePage } from "../License/LicensePage";
import { UserPage } from "../User/UserPage";
import { GroupPage } from "../Group/GroupPage";
import { TeamPage } from "../Team/TeamPage";
import { PipelinePage } from "../Pipeline/PipelinePage";
import { RunnerPage } from "../Runner/RunnerPage";

type CenterContentProps = {
  selected: string;
};

export const CenterContent = ({ selected }: CenterContentProps) => {
  if (!selected) {
    return <img className="image" alt="logo" src="/image/banner.png" />;
  }
  switch (selected) {
    case "BOARD":
      return <BoardPage />;
    case "LICENCE":
      return <LicencePage />;
    case "USER":
      return <UserPage />;
    case "GROUP":
      return <GroupPage />;
    case "TEAM/PRJ":
      return <TeamPage />;
    case "PIPELINE":
      return <PipelinePage />;
    case "RUNNER":
      return <RunnerPage />;
    default:
      return null;
  }
};