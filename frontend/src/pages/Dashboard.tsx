import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
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

  const totalEmails = campaigns.reduce(
    (total, campaign) => total + (campaign.emails?.length || 0),
    0
  );

  const sentEmails = campaigns.reduce(
    (total, campaign) =>
      total +
      (campaign.emails?.filter(
        (email: any) => email.status === "SENT"
      ).length || 0),
    0
  );

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-area">
        <Navbar />

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Dashboard</h1>
              <p>Overview of your email campaigns</p>
            </div>

            <button
              className="primary-button"
              onClick={() => navigate("/campaigns/create")}
            >
              <Plus size={18} />
              New Campaign
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">
                <Mail size={22} />
              </div>

              <div>
                <span>Total Campaigns</span>
                <strong>{campaigns.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <Send size={22} />
              </div>

              <div>
                <span>Total Emails</span>
                <strong>{totalEmails}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Clock size={22} />
              </div>

              <div>
                <span>Scheduled</span>
                <strong>
                  {totalEmails - sentEmails}
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle size={22} />
              </div>

              <div>
                <span>Sent</span>
                <strong>{sentEmails}</strong>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>Recent Campaigns</h2>
                <p>Your latest email campaigns</p>
              </div>

              <button
                className="text-button"
                onClick={() => navigate("/campaigns")}
              >
                View all
                <ArrowRight size={16} />
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="empty-state">
                <Mail size={40} />
                <h3>No campaigns yet</h3>
                <p>Create your first campaign to get started.</p>

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
              <div className="campaign-list">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div
                    className="campaign-row"
                    key={campaign.id}
                    onClick={() =>
                      navigate(`/campaigns/${campaign.id}`)
                    }
                  >
                    <div className="campaign-info">
                      <div className="campaign-icon">
                        <Mail size={18} />
                      </div>

                      <div>
                        <strong>{campaign.name}</strong>
                        <span>{campaign.subject}</span>
                      </div>
                    </div>

                    <div className="campaign-status">
                      {campaign.isPaused ? (
                        <span className="status paused">
                          Paused
                        </span>
                      ) : (
                        <span className="status active">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}