import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { StatCard, LoadingSpinner, ErrorAlert } from "../components/Header";
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Wrench,
  IndianRupee,
  AlertCircle,
  RefreshCw,
  Heart,
} from "lucide-react";
import { useNavigation } from "../hooks/useNavigation";

export function DashboardPage() {
  const navigate = useNavigation();
  const [stats, setStats] = useState(null);
  const [pickupStats, setPickupStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoMsg, setVideoMsg] = useState("");
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoFileName, setVideoFileName] = useState("");
  const [videoMode, setVideoMode] = useState("url");
  const [isUploadedStored, setIsUploadedStored] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    loadStats();
    adminAPI
      .getDemoVideo()
      .then((r) => {
        const u = r.data?.demoVideo?.url || "";
        if (u.startsWith("data:")) {
          setIsUploadedStored(true);
          setVideoUrl("");
          setVideoMode("file");
        } else {
          setVideoUrl(u);
          setIsUploadedStored(false);
          setVideoMode("url");
        }
        setVideoTitle(r.data?.demoVideo?.title || "");
      })
      .catch(() => {});
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const saveDemoVideo = async () => {
    setSavingVideo(true);
    setVideoMsg("");
    try {
      await adminAPI.updateDemoVideo({
        demoVideoUrl: videoUrl.trim(),
        demoVideoTitle: videoTitle.trim() || "How Eco Scrap works",
      });
      setIsUploadedStored(false);
      setVideoMsg("Demo video URL saved — mobile home will use this link.");
    } catch (err) {
      setVideoMsg(err?.response?.data?.message || "Failed to save video");
    } finally {
      setSavingVideo(false);
    }
  };

  const onGalleryPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setVideoMsg("Please choose a video file (mp4, webm, mov)");
      return;
    }
    if (file.size > 18 * 1024 * 1024) {
      setVideoMsg("Max 18MB. Compress or use a hosted URL.");
      return;
    }
    setSavingVideo(true);
    setVideoMsg("");
    setVideoFileName(file.name);
    try {
      const res = await adminAPI.uploadDemoVideo(
        file,
        videoTitle.trim() || "How Eco Scrap works",
      );
      setIsUploadedStored(true);
      setVideoMode("file");
      setVideoUrl("");
      setVideoMsg(
        res.data?.message || `Uploaded “${file.name}” for app home.`,
      );
    } catch (err) {
      setVideoMsg(
        err?.response?.data?.message ||
          "Upload failed. Try smaller file or paste URL.",
      );
    } finally {
      setSavingVideo(false);
    }
  };

  const loadStats = async () => {
    try {
      setError("");
      const [dashResponse, pickupResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPickupStats(),
      ]);
      setStats(dashResponse.data.stats);
      setPickupStats(pickupResponse.data.stats);
      setLastRefresh(new Date());
    } catch (err) {
      const status = err?.response?.status;
      if (!err?.response) {
        setError(
          "Backend offline / cold start. Wait ~30s and refresh (Render free tier).",
        );
      } else if (status === 404) {
        setError("API 404. Check admin API base URL points to /api");
      } else if (status === 401 || status === 403) {
        setError("Unauthorized. Login with admin account.");
      } else {
        setError(
          err?.response?.data?.message || "Failed to load dashboard stats",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const cashPaid =
    pickupStats?.totalCashPaid ?? stats?.totalCashPaidToUsers ?? 0;
  const paidPickups = pickupStats?.paidPickups ?? stats?.paidPickups ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              Cash mode
            </span>
            {lastRefresh && (
              <span className="text-xs text-gray-400">
                Updated {lastRefresh.toLocaleTimeString("en-IN")}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Operations Dashboard
          </h2>
          <p className="text-gray-600 max-w-2xl">
            Assign scrapers, track pickups, review KYC. Scrapers pay users in
            cash and record the amount — you see every rupee here.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStats}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {/* Cash summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white p-6 shadow-lg">
          <p className="text-emerald-100 text-sm font-medium">
            Total cash paid to users
          </p>
          <p className="text-4xl font-extrabold mt-2 tracking-tight">
            ₹{Number(cashPaid).toLocaleString("en-IN")}
          </p>
          <p className="text-emerald-100 text-xs mt-2">
            From {paidPickups} completed paid pickups
          </p>
        </div>
        <div className="card flex flex-col justify-center">
          <p className="text-sm text-gray-500 font-medium">Needs attention</p>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => navigate("/pickups")}
              className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-amber-50 border border-amber-100"
            >
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                Pending pickups
              </span>
              <span className="font-bold text-amber-700">
                {pickupStats?.pending ?? 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/pickups")}
              className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-100"
            >
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-blue-600" />
                Unassigned
              </span>
              <span className="font-bold text-blue-700">
                {pickupStats?.unassigned ?? 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/scrapers")}
              className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-purple-50 border border-purple-100"
            >
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Wrench size={16} className="text-purple-600" />
                KYC pending
              </span>
              <span className="font-bold text-purple-700">
                {stats?.pendingApps ?? 0}
              </span>
            </button>
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium mb-3">Quick actions</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              className="btn-primary text-left"
              onClick={() => navigate("/pickups")}
            >
              Manage pickups
            </button>
            <button
              type="button"
              className="btn-secondary text-left"
              onClick={() => navigate("/scrapers")}
            >
              Review scrapers / KYC
            </button>
            <button
              type="button"
              className="btn-secondary text-left"
              onClick={() => navigate("/happy-customers")}
            >
              Happy customers
            </button>
            <button
              type="button"
              className="btn-secondary text-left"
              onClick={() => navigate("/rates")}
            >
              Rate catalog
            </button>
          </div>
        </div>
      </div>

      {/* Pickup stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} className="text-emerald-600" />
          Pickup overview
        </h3>
        {pickupStats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard title="Total" value={pickupStats.total} icon={Package} color="blue" />
            <StatCard title="Pending" value={pickupStats.pending} icon={Clock} color="yellow" />
            <StatCard title="Accepted" value={pickupStats.accepted} icon={CheckCircle} color="blue" />
            <StatCard title="Completed" value={pickupStats.completed} icon={CheckCircle} color="green" />
            <StatCard title="Cancelled" value={pickupStats.cancelled} icon={XCircle} color="red" />
            <StatCard
              title="Cash paid"
              value={`₹${Number(pickupStats.totalCashPaid || 0).toLocaleString("en-IN")}`}
              icon={IndianRupee}
              color="green"
            />
          </div>
        ) : (
          <p className="text-gray-500">Loading pickup stats…</p>
        )}
      </div>

      {/* Users / scrapers */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-emerald-600" />
            Users & scrapers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Customers" value={stats.totalUsers ?? 0} icon={Users} color="blue" />
            <StatCard title="Scrapers" value={stats.totalScrapers ?? 0} icon={Wrench} color="green" />
            <StatCard title="KYC pending" value={stats.pendingApps ?? 0} icon={Clock} color="yellow" />
            <StatCard title="Paid pickups" value={stats.paidPickups ?? paidPickups} icon={IndianRupee} color="green" />
          </div>
        </div>
      )}

      {/* How cash ops work */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
        <h3 className="font-bold text-emerald-900 mb-2">Cash workflow (live)</h3>
        <ol className="list-decimal list-inside text-sm text-emerald-900/90 space-y-1">
          <li>User schedules pickup (optional scrap photos).</li>
          <li>Nearby scrapers get notified · you can also assign from Pickups.</li>
          <li>You pay scrapper offline (float / cash settlement).</li>
          <li>Scrapper pays user cash and records amount on Complete.</li>
          <li>Amount shows for Admin, User (My Pickups · Earned), and Scrapper.</li>
        </ol>
      </div>

      {/* Demo video */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Home demo video
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Plays under hero on the mobile app. Paste URL or upload from gallery.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={videoMode === "url" ? "btn-primary text-sm" : "btn-secondary text-sm"}
            onClick={() => setVideoMode("url")}
          >
            Paste URL
          </button>
          <button
            type="button"
            className={videoMode === "file" ? "btn-primary text-sm" : "btn-secondary text-sm"}
            onClick={() => setVideoMode("file")}
          >
            Upload from gallery
          </button>
        </div>

        <div className="space-y-3 max-w-2xl">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              className="input-field mt-1"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="How Eco Scrap works"
            />
          </div>

          {videoMode === "url" ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Video URL (https)
                </label>
                <input
                  className="input-field mt-1"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../demo.mp4"
                />
              </div>
              <button
                type="button"
                className="btn-primary"
                disabled={savingVideo || !videoUrl.trim()}
                onClick={saveDemoVideo}
              >
                {savingVideo ? "Saving..." : "Save URL"}
              </button>
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                MP4 / WebM / MOV · max 18MB
              </p>
              <label className="btn-primary inline-block cursor-pointer">
                {savingVideo ? "Uploading..." : "Choose video file"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={savingVideo}
                  onChange={onGalleryPick}
                />
              </label>
              {videoFileName && (
                <p className="text-xs text-gray-500 mt-2">Selected: {videoFileName}</p>
              )}
              {isUploadedStored && (
                <p className="text-sm text-green-700 font-medium mt-3">
                  ✓ Video file stored for app home
                </p>
              )}
            </div>
          )}

          {videoMsg && (
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
              {videoMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
