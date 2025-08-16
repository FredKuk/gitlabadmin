// src/pages/LicencePage.tsx

import React, { useState } from "react";
import LicenseModal from "../../components/LicenseModal";
import "./LicensePage.scss";

// Mock 데이터
const mockData = {
  period: {
    start: "2026.03.01",
    end: "2027.08.01",
  },
  totalUsers: 590, // 총유저 추가
  license: "hanabank.com.license",
  licenseButtons: ["View", "Down", "Upload"],
  certificateData: [
    { label: "ca", date: "2025.06.06~", content: "ca certificate content..." },
    {
      label: "ca-dev",
      date: "2025.06.06~",
      content: "ca-dev certificate content...",
    },
  ],
  serviceData: [
    {
      label: "gitlab rb",
      date: "2025.06.06~",
      content: "gitlab rb license content...",
    },
    {
      label: "nginx",
      date: "2025.06.06~",
      content: "nginx license content...",
    },
    { label: "pem", date: "2025.06.06~", content: "pem license content..." },
    { label: "ca", date: "2025.06.06~", content: "ca license content..." },
  ],
};

// Build 계열 mock 데이터 추가
const buildData = [
  { label: "config", date: "2025.06.06~", content: "config..." },
  { label: "gitlab-runner", date: "2025.06.06~", content: "gitlab-runner..." },
  { label: "podman", date: "2025.06.06~", content: "podman..." },
  { label: "socket", date: "2025.06.06~", content: "socket..." },
];

// 섹션 정보 배열 순서 및 이름 수정
const serviceSections = [
  { title: "Primary", version: "1.0", os: "Linux", data: mockData.serviceData },
  { title: "Secondary", version: "1.0", os: "Linux", data: mockData.serviceData },
  { title: "DR", version: "1.0", os: "Linux", data: mockData.serviceData },
  { title: "Build1", version: "1.0", os: "Linux", data: buildData },
  { title: "Build2", version: "1.0", os: "Linux", data: buildData },
  { title: "DR-Build1", version: "1.0", os: "Linux", data: buildData },
  { title: "Primary -Dev", version: "1.0", os: "Linux", data: mockData.serviceData },
  { title: "Secondary -Dev", version: "1.0", os: "Linux", data: mockData.serviceData },
];

// 재사용 가능한 ServiceSection 컴포넌트의 타입 정의
interface ServiceSectionProps {
  title: string;
  version: string; // version 추가
  os: string; // os 추가
  data: { label: string; date: string; content: string }[];
  licenseButtons: string[];
  onView: (content: string) => void;
  onDownload: (filename: string) => void;
  onUpload: () => void;
}

// ServiceSection 컴포넌트에서 클래스명 및 스타일 적용
const ServiceSection: React.FC<ServiceSectionProps> = ({
  title,
  version,
  os,
  data,
  licenseButtons,
  onView,
  onDownload,
  onUpload,
}) => (
  <div className="license-section">
    <div className="section-title">
      <span className="section-title-left">{title}</span>
      <span className="section-title-right">
        <span className="section-version">ver. {version}</span>
        <span className="section-os">{os}</span>
      </span>
    </div>
    {data.map((item, index) => (
      <div key={index} className="info-row license-row">
        <div className="info-label compact">{item.label}</div>
        <div className="info-value-wide compact">{item.date}</div>
        <div className="config-buttons-row">
          {licenseButtons.map((button, buttonIndex) => (
            <button
              key={buttonIndex}
              className={
                button === "View"
                  ? "primary"
                  : button === "Down"
                  ? "secondary"
                  : "dr"
              }
              onClick={() => {
                if (button === "View") onView(item.content);
                else if (button === "Down") onDownload(item.label);
                else if (button === "Upload") onUpload();
              }}
            >
              {button}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const LicencePage: React.FC = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewContent, setViewContent] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 총유저 인라인 편집 상태
  const [totalUsers, setTotalUsers] = useState<number>(mockData.totalUsers);
  const [isEditingUsers, setIsEditingUsers] = useState(false);
  const [tempUsers, setTempUsers] = useState<string>(String(mockData.totalUsers));

  const startEditUsers = () => {
    setTempUsers(String(totalUsers));
    setIsEditingUsers(true);
  };
  const commitUsers = () => {
    const parsed = parseInt((tempUsers || "").replace(/,/g, ""), 10);
    if (!isNaN(parsed) && parsed >= 0) setTotalUsers(parsed);
    setIsEditingUsers(false);
  };
  const cancelUsers = () => {
    setTempUsers(String(totalUsers));
    setIsEditingUsers(false);
  };

  const handleViewClick = (content: string) => {
    setViewContent(content);
    setIsViewModalOpen(true);
  };

  const handleDownloadClick = (filename: string) => {
    console.log(`Downloading file: ${filename}`);
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className="license-page">
      <div className="table-wrapper">
        <h2>License/Config</h2>

        <div className="license-info-top">
          <div className="info-row">
            {/* 총유저 | 590 | 기간 | 2026.03.01 | 2027.08.01 */}
            <div className="info-label little-padding">총유저</div>
            <div
              className="info-value info-border-right little-padding editable"
              onClick={!isEditingUsers ? startEditUsers : undefined}
              title="클릭하여 수정"
              role="button"
            >
              {isEditingUsers ? (
                <input
                  type="number"
                  className="inline-edit-input"
                  value={tempUsers}
                  autoFocus
                  onChange={(e) => setTempUsers(e.target.value)}
                  onBlur={commitUsers}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitUsers();
                    if (e.key === "Escape") cancelUsers();
                  }}
                />
              ) : (
                totalUsers.toLocaleString()
              )}
            </div>
            <div className="info-label little-padding">기간</div>
            <div className="info-value info-border-right little-padding">
              {mockData.period.start}
            </div>
            <div className="info-value little-padding">
              {mockData.period.end}
            </div>
          </div>
          <div className="info-row license-row">
            <div className="info-label little-padding">라이센스</div>
            <div className="info-value-wide little-padding">
              {mockData.license}
            </div>
            <div className="license-buttons-row  little-padding">
              {mockData.licenseButtons.map((button, index) => (
                <button
                  key={index}
                  className={
                    button === "View"
                      ? "primary"
                      : button === "Down"
                      ? "secondary"
                      : "dr"
                  }
                  onClick={() => {
                    if (button === "View") {
                      handleViewClick(mockData.license);
                    } else if (button === "Down") {
                      handleDownloadClick(mockData.license);
                    } else if (button === "Upload") {
                      handleUploadClick();
                    }
                  }}
                >
                  {button}
                </button>
              ))}
            </div>
          </div>
          {mockData.certificateData.map((item, index) => (
            <div key={index} className="info-row license-row">
              <div className="info-label little-padding">{item.label}</div>
              <div className="info-value-wide little-padding">{item.date}</div>
              <div className="license-buttons-row little-padding">
                {mockData.licenseButtons.map((button, buttonIndex) => (
                  <button
                    key={buttonIndex}
                    className={
                      button === "View"
                        ? "primary"
                        : button === "Down"
                        ? "secondary"
                        : "dr"
                    }
                    onClick={() => {
                      if (button === "View") {
                        handleViewClick(item.content);
                      } else if (button === "Down") {
                        handleDownloadClick(item.label);
                      } else if (button === "Upload") {
                        handleUploadClick();
                      }
                    }}
                  >
                    {button}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="license-sections-grid">
          {serviceSections.map((section, idx) => (
            <ServiceSection
              key={section.title}
              title={section.title}
              version={section.version}
              os={section.os}
              data={section.data}
              licenseButtons={mockData.licenseButtons}
              onView={handleViewClick}
              onDownload={handleDownloadClick}
              onUpload={handleUploadClick}
            />
          ))}
        </div>

        {/* View Modal */}
        <LicenseModal
          isOpen={isViewModalOpen}
          title="View License"
          onClose={() => setIsViewModalOpen(false)}
        >
          <div className="modal-content-area">
            <pre>{viewContent}</pre>
            <div className="modal-buttons">
              <button
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(viewContent)}
              >
                Copy
              </button>
              <button
                className="close-button"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </LicenseModal>

        {/* Upload Modal (작게 표시) */}
        <LicenseModal
          isOpen={isUploadModalOpen}
          title="Upload License"
          onClose={() => setIsUploadModalOpen(false)}
          // modal-content에 upload-modal 클래스 추가
          className="upload-modal"
        >
          <div className="modal-upload-content">
            <input type="file" />
            <button
              className="upload-button"
              onClick={() => alert("Upload logic here")}
            >
              Upload
            </button>
          </div>
        </LicenseModal>
      </div>
    </div>
  );
};
