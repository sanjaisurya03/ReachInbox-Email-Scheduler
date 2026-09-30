import {
  Mail,
  Plus,
  MoreVertical,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Campaigns() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCampaigns() {
    try {
      const response = await api.get("/campaigns");
      setCampaigns(response.data.data || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function togglePause(campaign: any) {
    try {
      if (campaign.isPaused) {
        await api.post(`/campaigns/${campaign.id}/resume`);
      } else {
        await api.post(`/campaigns/${campaign.id}/pause`);
      }

      loadCampaigns();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Unable to update campaign"
      );
    }
  }

  async function deleteCampaign(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this campaign?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/campaigns/${id}`);
      loadCampaigns();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Unable to delete campaign"
      );
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-area">
        <Navbar />

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Campaigns</h1>
              <p>Manage all your email campaigns</p>
            </div>

            <button
              className="primary-button"
              onClick={() => navigate("/campaigns/create")}
            >
              <Plus size={18} />
              New Campaign
            </button>
          </div>

          <div className="section-card">
            {loading ? (
              <div className="empty-state">
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="empty-state">
                <Mail size={42} />
                <h3>No campaigns found</h3>
                <p>Create your first email campaign.</p>

                <button
                  className="primary-button"
                  onClick={() =>
                    navigate("/campaigns/create")
                  }
                >
                  <Plus size={18} />
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Subject</th>
                      <th>Start Time</th>
                      <th>Delay</th>
                      <th>Limit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td>
                          <div className="table-campaign">
                            <div className="campaign-icon">
                              <Mail size={17} />
                            </div>

                            <strong>
                              {campaign.name}
                            </strong>
                          </div>
                        </td>

                        <td>{campaign.subject}</td>

                        <td>
                          {new Date(
                            campaign.startTime
                          ).toLocaleString()}
                        </td>

                        <td>{campaign.delayMs} ms</td>

                        <td>{campaign.hourlyLimit}/hr</td>

                        <td>
                          {campaign.isPaused ? (
                            <span className="status paused">
                              Paused
                            </span>
                          ) : (
                            <span className="status active">
                              Active
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              title={
                                campaign.isPaused
                                  ? "Resume"
                                  : "Pause"
                              }
                              onClick={() =>
                                togglePause(campaign)
                              }
                            >
                              {campaign.isPaused ? (
                                <Play size={17} />
                              ) : (
                                <Pause size={17} />
                              )}
                            </button>

                            <button
                              title="View"
                              onClick={() =>
                                navigate(
                                  `/campaigns/${campaign.id}`
                                )
                              }
                            >
                              <MoreVertical size={17} />
                            </button>

                            <button
                              className="danger-button"
                              title="Delete"
                              onClick={() =>
                                deleteCampaign(
                                  campaign.id
                                )
                              }
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
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

export default Campaigns;