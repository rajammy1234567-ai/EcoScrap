import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { StatCard, LoadingSpinner, ErrorAlert } from "../components/Header";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [pickupStats, setPickupStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoMsg, setVideoMsg] = useState("");
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoFileName, setVideoFileName] = useState("");
  const [videoMode, setVideoMode] = useState("url"); // url | file
  const [isUploadedStored, setIsUploadedStored] = useState(false);

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
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
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
      setVideoMsg("Demo video URL saved — app home will play this link.");
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
      setVideoMsg("Max video size 18MB. Compress the file or use a hosted URL.");
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
        res.data?.message ||
          `Uploaded “${file.name}” — mobile home will use this video.`,
      );
    } catch (err) {
      setVideoMsg(
        err?.response?.data?.message ||
          "Upload failed. Try a smaller file or paste a URL instead.",
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
    } catch (err) {
      const status = err?.response?.status;
      if (!err?.response) {
        setError(
          "Backend offline / slow. URL: https://ecoscrap-1.onrender.com — 30s wait karke refresh (Render cold start).",
        );
      } else if (status === 404) {
        setError(
          "API 404. Check .env → VITE_API_URL=https://ecoscrap-1.onrender.com/api",
        );
      } else if (status === 401 || status === 403) {
        setError("Unauthorized. Admin account se login karo.");
      } else {
        setError(err?.response?.data?.message || "Failed to load dashboard stats");
      }
      console.error("[Dashboard]", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Welcome to your admin panel. Here's an overview of your operations.
        </p>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {/* Pickup Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📦 Pickup Overview
        </h3>
        {pickupStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Pickups"
              value={pickupStats.total}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Pending"
              value={pickupStats.pending}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Accepted"
              value={pickupStats.accepted}
              icon={CheckCircle}
              color="blue"
            />
            <StatCard
              title="Completed"
              value={pickupStats.completed}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Cancelled"
              value={pickupStats.cancelled}
              icon={XCircle}
              color="red"
            />
          </div>
        ) : (
          <p className="text-gray-500">Loading pickup stats...</p>
        )}
      </div>

      {/* Scrap Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ♻️ Scrap Items Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Items"
              value={stats.total}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Pending Review"
              value={stats.pending}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Accepted"
              value={stats.accepted}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue || 0}`}
              icon={Package}
              color="green"
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="#/pickups" className="btn-primary block text-center">
            View All Pickups
          </a>
          <a href="#/users" className="btn-secondary block text-center">
            View Users
          </a>
          <button onClick={loadStats} className="btn-secondary">
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Mobile home demo video — URL or gallery upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🎬 Home demo video
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          App home pe hero ke neeche chalta hai.{" "}
          <strong>URL paste</strong> karo ya <strong>gallery / PC se upload</strong>.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={
              videoMode === "url"
                ? "btn-primary text-sm"
                : "btn-secondary text-sm"
            }
            onClick={() => setVideoMode("url")}
          >
            Paste URL
          </button>
          <button
            type="button"
            className={
              videoMode === "file"
                ? "btn-primary text-sm"
                : "btn-secondary text-sm"
            }
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
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">
                  Choose MP4 / WebM / MOV from gallery or computer (max 18MB)
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
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {videoFileName}
                  </p>
                )}
                {isUploadedStored && (
                  <p className="text-sm text-green-700 font-medium mt-3">
                    ✓ A video file is already stored for the app home.
                  </p>
                )}
              </div>
            </>
          )}

          {videoMsg && (
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {videoMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
