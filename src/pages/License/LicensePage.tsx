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

// 재사용 가능한 ServiceSection 컴포넌트의 타입 정의
interface ServiceSectionProps {
  title: string;
  data: { label: string; date: string; content: string }[];
  licenseButtons: string[];
  onView: (content: string) => void;
  onDownload: (filename: string) => void;
  onUpload: () => void;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({
  title,
  data,
  licenseButtons,
  onView,
  onDownload,
  onUpload,
}) => (
  <div className="license-section">
    <div className="section-title">{title}</div>
    {data.map((item, index) => (
      <div key={index} className="info-row license-row">
        <div className="info-label">{item.label}</div>
        <div className="info-value-wide">{item.date}</div>
        <div className="license-buttons-col">
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
        <h2>License 화면</h2>

        <div className="license-info-top">
          <div className="info-row">
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

        <div className="license-sections-container">
          <ServiceSection
            title="Primary"
            data={mockData.serviceData}
            licenseButtons={mockData.licenseButtons}
            onView={handleViewClick}
            onDownload={handleDownloadClick}
            onUpload={handleUploadClick}
          />
          <ServiceSection
            title="Secondary"
            data={mockData.serviceData}
            licenseButtons={mockData.licenseButtons}
            onView={handleViewClick}
            onDownload={handleDownloadClick}
            onUpload={handleUploadClick}
          />
          <ServiceSection
            title="DR"
            data={mockData.serviceData}
            licenseButtons={mockData.licenseButtons}
            onView={handleViewClick}
            onDownload={handleDownloadClick}
            onUpload={handleUploadClick}
          />
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
