import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "../components/Header";
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Truck,
  Phone,
  Mail,
  MapPin,
  Wallet,
  IndianRupee,
} from "lucide-react";

const VEHICLE_LABELS = {
  bike: "Bike",
  scooter: "Scooter",
  auto: "Auto",
  "e-rickshaw": "E-Rickshaw",
  "mini-truck": "Mini Truck",
  truck: "Truck",
  other: "Other",
};

export function ScrappersPage() {
  const [tab, setTab] = useState("applications"); // applications | scrapers | wallets | payouts
  const [applications, setApplications] = useState([]);
  const [scrapers, setScrapers] = useState([]);
  const [walletOverview, setWalletOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [topupUser, setTopupUser] = useState(null);
  const [topupAmount, setTopupAmount] = useState("1000");
  const [topupNote, setTopupNote] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

  const limit = 20;

  useEffect(() => {
    loadTab();
  }, [tab, statusFilter, page]);

  const loadTab = () => {
    if (tab === "applications") loadApplications();
    else if (tab === "scrapers") loadScrapers();
    else if (tab === "wallets") loadWallets();
    else if (tab === "payouts") loadPayouts();
  };

  const loadApplications = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await adminAPI.getScrapperApplications({
        status: statusFilter || undefined,
        page,
        limit,
      });
      setApplications(res.data.applications || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError("Failed to load scrapper applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadScrapers = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await adminAPI.getScrapers();
      setScrapers(res.data.scrapers || []);
    } catch (err) {
      setError("Failed to load scrapers");
    } finally {
      setLoading(false);
    }
  };

  const loadWallets = async () => {
    try {
      setError("");
      setLoading(true);
      const [wRes, tRes] = await Promise.all([
        adminAPI.getWallets(),
        adminAPI.getWalletTransactions({ limit: 40 }),
      ]);
      setWalletOverview(wRes.data);
      setTransactions(tRes.data.transactions || []);
    } catch (err) {
      setError("Failed to load wallet ledger");
    } finally {
      setLoading(false);
    }
  };

  const loadPayouts = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await adminAPI.getPayouts({ page, limit: 30 });
      setPayouts(res.data.payouts || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  const openReview = async (app) => {
    setSelected(app);
    setReviewNote(app.adminNote || "");
    setDetailLoading(true);
    try {
      const res = await adminAPI.getScrapperApplication(app.id || app._id);
      setSelected(res.data.application);
    } catch {
      // keep list payload
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!selected) return;
    if (status === "rejected" && !reviewNote.trim()) {
      setError("Please enter a rejection reason");
      return;
    }
    try {
      setReviewing(true);
      setError("");
      const res = await adminAPI.reviewScrapperApplication(
        selected.id || selected._id,
        { status, adminNote: reviewNote.trim() },
      );
      setSuccess(
        status === "approved"
          ? res.data.message ||
              "Approved! Scrapper can accept jobs and record cash payments."
          : "Application rejected. User notified with reason.",
      );
      setSelected(null);
      setReviewNote("");
      loadApplications();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to review application");
    } finally {
      setReviewing(false);
    }
  };

  const handleTopup = async () => {
    if (!topupUser) return;
    try {
      setTopupLoading(true);
      await adminAPI.topupWallet({
        userId: topupUser._id,
        amount: Number(topupAmount),
        note: topupNote,
      });
      setSuccess(`Top-up ₹${topupAmount} successful`);
      setTopupUser(null);
      setTopupAmount("1000");
      setTopupNote("");
      if (tab === "wallets") loadWallets();
      if (tab === "scrapers") loadScrapers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Top-up failed");
    } finally {
      setTopupLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status) => {
    const map = {
      pending: "badge-pending",
      approved: "badge-completed",
      rejected: "badge-cancelled",
      completed: "badge-completed",
      processing: "badge-accepted",
      failed: "badge-cancelled",
      credit: "badge-completed",
      debit: "badge-pending",
    };
    return map[status] || "badge-pending";
  };

  const KycThumb = ({ doc, label }) => {
    if (!doc?.dataUri) {
      return (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-400">
          {label}: missing
        </div>
      );
    }
    return (
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <a href={doc.dataUri} target="_blank" rel="noreferrer">
          <img
            src={doc.dataUri}
            alt={label}
            className="w-full h-36 object-cover rounded-lg border border-gray-200 hover:opacity-90"
          />
        </a>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            🛠️ Scrapper & Wallet
          </h2>
          <p className="text-gray-600">
            KYC review · cash pickup records (admin pays scrapper offline)
          </p>
        </div>
        <button onClick={loadTab} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess("")} />
      )}

      <div className="flex gap-2 flex-wrap">
        {[
          ["applications", "Applications / KYC"],
          ["scrapers", "Approved Scrapers"],
          ["wallets", "Wallet Ledger"],
          ["payouts", "Customer Payouts"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === key ? "btn-primary" : "btn-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* APPLICATIONS */}
      {tab === "applications" && (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 flex gap-2 flex-wrap">
            {["pending", "approved", "rejected", ""].map((s) => (
              <button
                key={s || "all"}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  statusFilter === s ? "btn-primary" : "btn-secondary"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : applications.length === 0 ? (
            <div className="card text-center py-12">
              <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">
                No applications found
              </h3>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="table-header">Applicant</th>
                    <th className="table-header">PAN / Aadhaar</th>
                    <th className="table-header">Vehicle</th>
                    <th className="table-header">KYC</th>
                    <th className="table-header">Applied</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.id || app._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="table-cell">
                        <p className="font-semibold text-gray-900">
                          {app.fullName}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={12} /> {app.phone}
                        </p>
                      </td>
                      <td className="table-cell text-sm font-mono">
                        <div>{app.panNumber || "—"}</div>
                        <div className="text-gray-500">
                          ****{String(app.aadhaarNumber || "").slice(-4)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <p className="font-medium">
                          {VEHICLE_LABELS[app.vehicleType] || app.vehicleType}
                        </p>
                        <p className="text-sm text-gray-500 font-mono">
                          {app.vehicleNumber}
                        </p>
                      </td>
                      <td className="table-cell">
                        {app.kycComplete || app.kyc?.aadhaarFront ? (
                          <span className="badge-completed">Docs OK</span>
                        ) : (
                          <span className="badge-pending">Incomplete</span>
                        )}
                      </td>
                      <td className="table-cell text-sm">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="table-cell">
                        <span className={statusBadge(app.status)}>
                          {app.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => openReview(app)}
                          className="btn-primary btn-small"
                        >
                          {app.status === "pending" ? "Review KYC" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* SCRAPERS */}
      {tab === "scrapers" &&
        (loading ? (
          <LoadingSpinner />
        ) : scrapers.length === 0 ? (
          <div className="card text-center py-12">
            <Truck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              No approved scrapers yet
            </h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scrapers.map((s) => (
              <div key={s._id} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg">
                    {(s.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {s.name}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone size={12} /> {s.phone || "—"}
                    </p>
                    {s.scrapperProfile?.city && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {s.scrapperProfile.city}
                      </p>
                    )}
                    <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Wallet size={14} /> Balance
                      </span>
                      <span className="font-bold text-green-700">
                        ₹{s.wallet?.balance ?? 0}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      In ₹{s.wallet?.totalCredited ?? 0} · Out ₹
                      {s.wallet?.totalDebited ?? 0}
                    </p>
                    <button
                      className="btn-secondary btn-small mt-2 w-full"
                      onClick={() => setTopupUser(s)}
                    >
                      Top-up wallet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* WALLETS LEDGER */}
      {tab === "wallets" &&
        (loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="card">
                <p className="text-sm text-gray-500">Total float in wallets</p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{walletOverview?.summary?.totalFloat ?? 0}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500">Total credited</p>
                <p className="text-2xl font-bold">
                  ₹{walletOverview?.summary?.totalCredited ?? 0}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500">Total spent (payouts)</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{walletOverview?.summary?.totalDebited ?? 0}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-500">Active wallets</p>
                <p className="text-2xl font-bold">
                  {walletOverview?.summary?.count ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Razorpay:{" "}
                  {walletOverview?.razorpay?.payoutsEnabled
                    ? "Payouts ON"
                    : walletOverview?.razorpay?.configured
                      ? "Keys set (payouts off)"
                      : "Not configured"}
                </p>
              </div>
            </div>

            <div className="card overflow-x-auto">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <IndianRupee size={18} /> Recent ledger
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="table-header">When</th>
                    <th className="table-header">Scrapper</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Category</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Balance after</th>
                    <th className="table-header">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-gray-50">
                      <td className="table-cell text-sm">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="table-cell">
                        {t.user?.name || "—"}
                        <div className="text-xs text-gray-400">
                          {t.user?.phone}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={statusBadge(t.type)}>{t.type}</span>
                      </td>
                      <td className="table-cell text-sm">{t.category}</td>
                      <td
                        className={`table-cell font-semibold ${
                          t.type === "credit"
                            ? "text-green-700"
                            : "text-orange-600"
                        }`}
                      >
                        {t.type === "credit" ? "+" : "−"}₹{t.amount}
                      </td>
                      <td className="table-cell">₹{t.balanceAfter}</td>
                      <td className="table-cell text-sm text-gray-600 max-w-[200px] truncate">
                        {t.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <p className="text-center text-gray-400 py-8">No transactions yet</p>
              )}
            </div>
          </div>
        ))}

      {/* PAYOUTS */}
      {tab === "payouts" &&
        (loading ? (
          <LoadingSpinner />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="table-header">Date</th>
                  <th className="table-header">Pickup</th>
                  <th className="table-header">Scrapper</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id || p._id} className="hover:bg-gray-50">
                    <td className="table-cell text-sm">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="table-cell font-mono text-sm">
                      {p.pickup?.displayId || "—"}
                    </td>
                    <td className="table-cell">
                      {p.scrapper?.name}
                      <div className="text-xs text-gray-400">
                        {p.scrapper?.phone}
                      </div>
                    </td>
                    <td className="table-cell">
                      {p.customer?.name}
                      <div className="text-xs text-gray-400">
                        {p.customerUpi || p.customer?.phone}
                      </div>
                    </td>
                    <td className="table-cell font-bold">₹{p.amount}</td>
                    <td className="table-cell text-sm">{p.method}</td>
                    <td className="table-cell">
                      <span className={statusBadge(p.status)}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payouts.length === 0 && (
              <p className="text-center text-gray-400 py-8">No payouts yet</p>
            )}
          </div>
        ))}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                KYC & Application
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {detailLoading && (
                <p className="text-sm text-gray-500">Loading KYC images…</p>
              )}

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-semibold">{selected.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-semibold">{selected.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Aadhaar</p>
                  <p className="font-semibold font-mono">
                    {selected.aadhaarNumber}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">PAN</p>
                  <p className="font-semibold font-mono">
                    {selected.panNumber}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Vehicle</p>
                  <p className="font-semibold">
                    {VEHICLE_LABELS[selected.vehicleType] ||
                      selected.vehicleType}{" "}
                    ({selected.vehicleNumber})
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">City / UPI</p>
                  <p className="font-semibold">
                    {selected.city} – {selected.pincode}
                  </p>
                  <p className="text-xs text-gray-500">{selected.upiId || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Address</p>
                  <p className="font-semibold">{selected.address}</p>
                </div>
                {selected.signupBonusCredited && (
                  <div className="col-span-2">
                    <span className="badge-completed">
                      Signup bonus ₹{selected.signupBonusAmount} credited
                    </span>
                  </div>
                )}
              </div>

              <h4 className="font-semibold text-gray-900">KYC Documents</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <KycThumb
                  doc={selected.kyc?.aadhaarFront}
                  label="Aadhaar Front"
                />
                <KycThumb
                  doc={selected.kyc?.aadhaarBack}
                  label="Aadhaar Back"
                />
                <KycThumb doc={selected.kyc?.panCard} label="PAN Card" />
                <KycThumb doc={selected.kyc?.selfie} label="Selfie" />
                <KycThumb
                  doc={selected.kyc?.cancelledCheque}
                  label="Cancelled Cheque"
                />
              </div>

              {selected.status === "pending" ? (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                    On <strong>Accept</strong>, scrapper can take jobs. Cash:
                    admin pays scrapper offline; scrapper pays user cash and
                    records amount on complete.
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin note / reason{" "}
                      <span className="text-red-500">(required for reject)</span>
                    </label>
                    <textarea
                      className="input-field min-h-[90px]"
                      placeholder="e.g. KYC verified / Blurry Aadhaar photo..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      disabled={reviewing}
                      onClick={() => handleReview("approved")}
                      className="btn-success flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      {reviewing ? "..." : "Accept"}
                    </button>
                    <button
                      disabled={reviewing}
                      onClick={() => handleReview("rejected")}
                      className="btn-danger flex-1 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      {reviewing ? "..." : "Reject"}
                    </button>
                  </div>
                </>
              ) : (
                selected.adminNote && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Admin note</p>
                    <p className="font-medium text-gray-900">
                      {selected.adminNote}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top-up modal */}
      {topupUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold">
              Top-up {topupUser.name}&apos;s wallet
            </h3>
            <p className="text-sm text-gray-500">
              Current: ₹{topupUser.wallet?.balance ?? 0}
            </p>
            <div>
              <label className="text-sm font-medium">Amount (₹)</label>
              <input
                type="number"
                className="input-field"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                min={1}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Note</label>
              <input
                className="input-field"
                value={topupNote}
                onChange={(e) => setTopupNote(e.target.value)}
                placeholder="Admin float top-up"
              />
            </div>
            <div className="flex gap-3">
              <button
                className="btn-success flex-1"
                disabled={topupLoading}
                onClick={handleTopup}
              >
                {topupLoading ? "..." : "Credit"}
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => setTopupUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
