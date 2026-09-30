import {
  ArrowLeft,
  Pause,
  Play,
  Trash2,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadCampaign() {
    try {
      const response = await api.get(`/campaigns/${id}`);
      setCampaign(response.data.data);
    } catch {
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaign();
  }, [id]);

  async function togglePause() {
    try {
      if (campaign.isPaused) {
        await api.post(`/campaigns/${id}/resume`);
      } else {
        await api.post(`/campaigns/${id}/pause`);
      }

      loadCampaign();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Unable to update campaign"
      );
    }
  }

  async function deleteCampaign() {
    const confirmed = window.confirm(
      "Delete this campaign?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/campaigns/${id}`);
      navigate("/campaigns");
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Unable to delete campaign"
      );
    }
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-area">
          <Navbar />
          <div className="page-content">
            Loading campaign...
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-area">
          <Navbar />
          <div className="page-content">
            <div className="empty-state">
              <h2>Campaign not found</h2>
              <button
                className="primary-button"
                onClick={() => navigate("/campaigns")}
              >
                Back to Campaigns
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const emails = campaign.emails || [];

  const sent = emails.filter(
    (email: any) => email.status === "SENT"
  ).length;

  const scheduled = emails.filter(
    (email: any) => email.status === "SCHEDULED"
  ).length;

  const failed = emails.filter(
    (email: any) => email.status === "FAILED"
  ).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-area">
        <Navbar />

        <div className="page-content">
          <button
            className="back-button"
            onClick={() => navigate("/campaigns")}
          >
            <ArrowLeft size={17} />
            Back to Campaigns
          </button>

          <div className="page-header">
            <div>
              <h1>{campaign.name}</h1>
              <p>{campaign.subject}</p>
            </div>

            <div className="header-actions">
              <button
                className="secondary-button"
                onClick={togglePause}
              >
                {campaign.isPaused ? (
                  <Play size={17} />
                ) : (
                  <Pause size={17} />
                )}

                {campaign.isPaused
                  ? "Resume"
                  : "Pause"}
              </button>

              <button
                className="danger-outline-button"
                onClick={deleteCampaign}
              >
                <Trash2 size={17} />
                Delete
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Mail size={22} />
              </div>

              <div>
                <span>Total Emails</span>
                <strong>{emails.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Mail size={22} />
              </div>

              <div>
                <span>Sent</span>
                <strong>{sent}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Mail size={22} />
              </div>

              <div>
                <span>Scheduled</span>
                <strong>{scheduled}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">
                <Mail size={22} />
              </div>

              <div>
                <span>Failed</span>
                <strong>{failed}</strong>
              </div>
            </div>
          </div>

          <div className="section-card campaign-details-card">
            <h2>Campaign Settings</h2>

            <div className="details-grid">
              <div>
                <span>Start Time</span>
                <strong>
                  {new Date(
                    campaign.startTime
                  ).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Email Delay</span>
                <strong>
                  {campaign.delayMs} ms
                </strong>
              </div>

              <div>
                <span>Hourly Limit</span>
                <strong>
                  {campaign.hourlyLimit}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {campaign.isPaused
                    ? "Paused"
                    : "Active"}
                </strong>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>Emails</h2>
                <p>
                  Emails scheduled in this campaign
                </p>
              </div>
            </div>

            {emails.length === 0 ? (
              <div className="empty-state">
                <Mail size={40} />
                <h3>No emails</h3>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Status</th>
                      <th>Scheduled</th>
                      <th>Sent</th>
                    </tr>
                  </thead>

                  <tbody>
                    {emails.map((email: any) => (
                      <tr key={email.id}>
                        <td>{email.recipient}</td>

                        <td>
                          <span
                            className={`status ${email.status.toLowerCase()}`}
                          >
                            {email.status}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            email.scheduledAt
                          ).toLocaleString()}
                        </td>

                        <td>
                          {email.sentAt
                            ? new Date(
                                email.sentAt
                              ).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}