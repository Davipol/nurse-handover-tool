"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Stethoscope,
  Plus,
  Activity,
} from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const PatientPage = () => {
  const params = useParams();
  const { bed } = params;

  const [patient, setPatient] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [handovers, setHandovers] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryUpdating, setSummaryUpdating] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'urgency' | 'void' | null
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [newUrgency, setNewUrgency] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Get session
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patient and handovers by bed
        const handoversRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${bed}/handovers`,
        );
        const handoversData = await handoversRes.json();

        setPatient(handoversData.patient);
        setHandovers(handoversData.handovers || []);

        // Fetch AI summary if there are handovers
        if (handoversData.handovers && handoversData.handovers.length > 0) {
          const summaryRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${bed}/summary`,
          );
          const summaryData = await summaryRes.json();
          setAiSummary(summaryData);

          // Check if summary needs updating
          if (summaryData.is_stale) {
            setSummaryUpdating(true);
            pollForUpdatedSummary();
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    // Poll for updated summary every 3 seconds
    const pollForUpdatedSummary = () => {
      const interval = setInterval(async () => {
        try {
          const summaryRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${bed}/summary`,
          );
          const summaryData = await summaryRes.json();

          if (!summaryData.is_stale) {
            // Summary is fresh now
            setAiSummary(summaryData);
            setSummaryUpdating(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error polling summary:", err);
        }
      }, 3000); // Poll every 3 seconds

      // Stop polling after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        setSummaryUpdating(false);
      }, 30000);
    };
    fetchData();
  }, [bed]);

  if (loading) return <LoadingSpinner />;

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-700">
              Error: Patient not found in bed {bed}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const conditions = (() => {
    if (!patient.conditions) return [];
    if (Array.isArray(patient.conditions)) return patient.conditions;
    try {
      return JSON.parse(patient.conditions);
    } catch {
      return [];
    }
  })();

  const urgencyColors = {
    critical: "bg-red-100 border-red-400 border-l-4",
    urgent: "bg-yellow-100 border-yellow-400 border-l-4",
    routine: "bg-green-100 border-green-400 border-l-4",
  };

  const urgencyBadgeColors = {
    critical: "bg-red-200 text-red-800",
    urgent: "bg-yellow-200 text-yellow-800",
    routine: "bg-green-200 text-green-800",
  };

  const handleUrgencyUpdate = async () => {
    if (!newUrgency) return;
    setModalLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/handovers/${selectedHandover.id}/urgency`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urgency: newUrgency }),
        },
      );
      const data = await res.json();
      setHandovers((prev) =>
        prev.map((h) =>
          h.id === selectedHandover.id
            ? { ...h, urgency: data.handover.urgency }
            : h,
        ),
      );
      setActiveModal(null);
      setSelectedHandover(null);
      setNewUrgency("");
    } catch (err) {
      console.error("Failed to update urgency:", err);
    }
    setModalLoading(false);
  };

  const handleVoid = async () => {
    if (!voidReason.trim()) return;
    setModalLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/handovers/${selectedHandover.id}/void`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voided_by: session.user.id,
            void_reason: voidReason,
          }),
        },
      );
      const data = await res.json();
      setHandovers((prev) =>
        prev.map((h) =>
          h.id === selectedHandover.id ? { ...h, ...data.handover } : h,
        ),
      );
      setActiveModal(null);
      setSelectedHandover(null);
      setVoidReason("");
    } catch (err) {
      console.error("Failed to void handover:", err);
    }
    setModalLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <Link
          href={`/units/${patient.unit_id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Unit
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Patient Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {patient.first_name} {patient.last_name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Bed Number</p>
              <p className="text-lg font-semibold text-gray-900">
                {patient.bed}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {patient.status}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(patient.date_of_birth).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Stethoscope className="w-4 h-4" />
                Conditions
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && aiSummary.ai_summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              AI Summary ({aiSummary.handover_count} handovers)
              {summaryUpdating && (
                <span className="flex items-center gap-2 text-sm font-normal text-blue-700">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              )}
            </h2>
            <div className="text-gray-800 space-y-3">
              {aiSummary.ai_summary
                .replace(/##\s*/g, "")
                .replace(/\*\*SBAR\*\*/g, "")
                .replace(/\*\*([^*]+)\*\*/g, "$1")
                .split("\n")
                .map((line, index) => {
                  const labelMatch = line.match(/^([A-Z][a-z]+):\s*(.+)$/);
                  if (labelMatch) {
                    return (
                      <p key={index}>
                        <strong className="font-semibold text-gray-900">
                          {labelMatch[1]}:
                        </strong>{" "}
                        {labelMatch[2]}
                      </p>
                    );
                  }
                  return line.trim() ? <p key={index}>{line}</p> : null;
                })}
            </div>
            <p className="text-xs text-gray-600 mt-3 italic">
              ⚠️ {aiSummary.disclaimer}
            </p>
          </div>
        )}

        {/* Handovers List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Handover Notes ({handovers.length})
          </h2>

          {handovers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No handovers for this patient
            </p>
          ) : (
            <div className="space-y-4">
              {handovers.map((handover) => (
                <div
                  key={handover.id}
                  className={`p-5 rounded-lg ${
                    handover.is_voided
                      ? "bg-gray-200 border-gray-400 border-l-4"
                      : urgencyColors[handover.urgency]
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            handover.is_voided
                              ? "bg-gray-300 text-gray-600"
                              : urgencyBadgeColors[handover.urgency]
                          }`}
                        >
                          {handover.urgency}
                        </span>
                        {handover.is_voided && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-200 text-red-700">
                            VOIDED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        📅{" "}
                        {new Date(handover.handover_date).toLocaleDateString(
                          "en-GB",
                        )}{" "}
                        -
                        <span className="capitalize ml-1 font-semibold">
                          {handover.shift}
                        </span>{" "}
                        shift
                        <br />
                        <span className="text-xs text-gray-600">
                          Nurse: {handover.nurse_name}
                        </span>
                      </p>
                      {handover.is_voided && (
                        <p className="text-xs text-red-600 mt-1">
                          Voided by {handover.voided_by_name} - "
                          {handover.void_reason}"
                        </p>
                      )}
                    </div>

                    {handover.vitals && (
                      <div className="text-sm text-gray-700 bg-white bg-opacity-50 rounded p-2">
                        <p>
                          <strong>BP:</strong> {handover.vitals.bloodPressure}
                        </p>
                        <p>
                          <strong>HR:</strong> {handover.vitals.pulse} bpm
                        </p>
                        <p>
                          <strong>Temp:</strong> {handover.vitals.temperature}°C
                        </p>
                        <p>
                          <strong>RR:</strong> {handover.vitals.respiratoryRate}
                        </p>
                        <p>
                          <strong>O2:</strong>{" "}
                          {handover.vitals.oxygenSaturation}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-gray-800">
                    <p
                      className={
                        handover.is_voided ? "line-through text-gray-500" : ""
                      }
                    >
                      {handover.content}
                    </p>
                  </div>
                  {!handover.is_voided && (
                    <div className="mt-4 flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setSelectedHandover(handover);
                          setNewUrgency(handover.urgency);
                          setActiveModal("urgency");
                        }}
                        className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Change Urgency
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHandover(handover);
                          setActiveModal("void");
                        }}
                        className="px-3 py-1 text-xs font-medium bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        Void Handover
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Urgency Modal */}
      {activeModal === "urgency" && selectedHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-white rounded-lg p-6 z-10 w-96 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Change Urgency
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Handover from{" "}
              {new Date(selectedHandover.handover_date).toLocaleDateString(
                "en-GB",
              )}{" "}
              — {selectedHandover.shift} shift
            </p>
            <select
              value={newUrgency}
              onChange={(e) => setNewUrgency(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-gray-900"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUrgencyUpdate}
                disabled={modalLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {modalLoading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {activeModal === "void" && selectedHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-white rounded-lg p-6 z-10 w-96 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Void Handover
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Handover from{" "}
              {new Date(selectedHandover.handover_date).toLocaleDateString(
                "en-GB",
              )}{" "}
              — {selectedHandover.shift} shift
            </p>
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Reason for voiding:
            </p>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="e.g. Duplicate entry, wrong patient..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-gray-900 h-24 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoid}
                disabled={modalLoading || !voidReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {modalLoading ? "Voiding..." : "Void Handover"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Button with Menu */}
      <div className="fixed bottom-8 right-8 z-50">
        {showMenu && (
          <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-2xl border-2 border-blue-400 py-2 mb-2 w-48 ring-4 ring-blue-100">
            <Link
              href={`/handovers/new?bed=${bed}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">New Handover</span>
            </Link>
            <Link
              href={`/vitals/new?bed=${bed}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            >
              <Activity className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Record Vitals</span>
            </Link>
          </div>
        )}

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus
            className={`w-6 h-6 transition-transform ${showMenu ? "rotate-45" : ""}`}
          />
        </button>
      </div>

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default PatientPage;
