import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaEnvelopeOpen,
  FaChartBar,
  FaCreditCard,
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { useAuth, getAuthHeaders } from "../context/authContext";
import { useNavigate } from "react-router-dom";

function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingContact, setViewingContact] = useState(null);

  // User search
  const [userSearch, setUserSearch] = useState("");

  // Plan modal states
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    price: "",
    credits: "",
    description: "",
    features: [],
    badge: "",
    isDefault: false,
    order: 0,
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, contactsRes, usersRes, paymentsRes, plansRes] =
          await Promise.all([
            axios.get(`${serverUrl}/api/admin/stats`, {
              headers: getAuthHeaders(),
            }),
            axios.get(`${serverUrl}/api/admin/contacts`, {
              headers: getAuthHeaders(),
            }),
            axios.get(`${serverUrl}/api/admin/users`, {
              headers: getAuthHeaders(),
              params: { search: userSearch },
            }),
            axios.get(`${serverUrl}/api/admin/payments`, {
              headers: getAuthHeaders(),
            }),
            axios.get(`${serverUrl}/api/admin/plans`, {
              headers: getAuthHeaders(),
            }),
          ]);
        setStats(statsRes.data);
        setContacts(contactsRes.data);
        setUsers(usersRes.data);
        setPayments(paymentsRes.data);
        setPlans(plansRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, userSearch]);

  const handleUpdateUserRole = async (userId, newRole) => {
    setError("");
    setSuccess("");
    try {
      await axios.patch(
        `${serverUrl}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: getAuthHeaders() },
      );
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
      setSuccess("User role updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUpdateContactStatus = async (contactId, newStatus) => {
    setError("");
    setSuccess("");
    try {
      await axios.patch(
        `${serverUrl}/api/admin/contacts/${contactId}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() },
      );
      setContacts(
        contacts.map((c) =>
          c._id === contactId ? { ...c, status: newStatus } : c,
        ),
      );
      if (viewingContact && viewingContact._id === contactId) {
        setViewingContact({ ...viewingContact, status: newStatus });
      }
      setSuccess("Contact status updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update contact status",
      );
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // Plan handlers
  const openPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        price: plan.price,
        credits: plan.credits,
        description: plan.description || "",
        features: plan.features || [],
        badge: plan.badge || "",
        isDefault: plan.isDefault || false,
        order: plan.order || 0,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: "",
        price: "",
        credits: "",
        description: "",
        features: [],
        badge: "",
        isDefault: false,
        order: 0,
      });
    }
    setPlanModalOpen(true);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingPlan) {
        await axios.patch(
          `${serverUrl}/api/admin/plans/${editingPlan._id}`,
          planForm,
          { headers: getAuthHeaders() },
        );
        setPlans(
          plans.map((p) =>
            p._id === editingPlan._id ? { ...p, ...planForm } : p,
          ),
        );
        setSuccess("Plan updated successfully!");
      } else {
        const res = await axios.post(`${serverUrl}/api/admin/plans`, planForm, {
          headers: getAuthHeaders(),
        });
        setPlans([res.data, ...plans]);
        setSuccess("Plan created successfully!");
      }
      setPlanModalOpen(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save plan");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(`${serverUrl}/api/admin/plans/${planId}`, {
        headers: getAuthHeaders(),
      });
      setPlans(plans.filter((p) => p._id !== planId));
      setSuccess("Plan deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete plan");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 shadow-lg flex-shrink-0">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white p-3 rounded-xl">
                <FaChartBar />
              </div>
              <h2 className="text-xl font-bold text-emerald-800">Admin</h2>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {[
              { id: "dashboard", name: "Overview", icon: FaChartBar },
              { id: "users", name: "Users", icon: FaUsers },
              { id: "contacts", name: "Inquiries", icon: FaEnvelopeOpen },
              { id: "plans", name: "Manage Plans", icon: FaCreditCard },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === item.id ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <item.icon />
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeTab === "dashboard" && "Admin Dashboard"}
                  {activeTab === "users" && "User Management"}
                  {activeTab === "contacts" && "Inquiry Management"}
                  {activeTab === "plans" && "Subscription Plans"}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">Admin</span>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mb-6"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-semibold overflow-hidden mb-6"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {stats?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                    <p className="text-sm text-gray-500 mb-1">
                      Total Interviews
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats?.totalInterviews || 0}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                    <p className="text-sm text-gray-500 mb-1">
                      Total Inquiries
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats?.totalContacts || 0}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                    <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      ₹{stats?.totalRevenue || 0}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                      Recent Users
                    </h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {u.name}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                      Recent Payments
                    </h3>
                    <div className="space-y-3">
                      {payments.slice(0, 5).map((p) => (
                        <div
                          key={p._id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {p.userId?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.planId
                                ? p.planId.charAt(0).toUpperCase() +
                                  p.planId.slice(1)
                                : "Unknown"}{" "}
                              - {p.credits} credits
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">
                              ₹{p.amount}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(p.status)}`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === "users" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Credits
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                            {user.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800 font-semibold">
                            {user.credits}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleUpdateUserRole(user._id, e.target.value)
                              }
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="candidate">Candidate</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts (Inquiries) */}
            {activeTab === "contacts" && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr
                          key={contact._id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                            {contact.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {contact.email}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {contact.subject}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contact.status)}`}
                            >
                              {contact.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button
                              onClick={() => setViewingContact(contact)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <FaEye size={14} />
                            </button>
                            {contact.status !== "resolved" && (
                              <button
                                onClick={() =>
                                  handleUpdateContactStatus(
                                    contact._id,
                                    "resolved",
                                  )
                                }
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              >
                                <FaCheckCircle size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Manage Plans */}
            {activeTab === "plans" && (
              <div className="space-y-8">
                <div className="flex justify-end">
                  <button
                    onClick={() => openPlanModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition cursor-pointer"
                  >
                    <FaPlus size={16} /> Add Plan
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plans.map((plan) => (
                    <div
                      key={plan._id}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-all relative"
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 -right-3 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                          {plan.badge}
                        </div>
                      )}
                      {plan.isDefault && (
                        <div className="absolute -top-3 -right-3 bg-gray-200 text-gray-700 text-xs px-4 py-1 rounded-full shadow">
                          Default
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {plan.name}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openPlanModal(plan)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-emerald-600">
                          ₹{plan.price}
                        </span>
                        <p className="text-gray-500 mt-1">
                          {plan.credits} Credits
                        </p>
                      </div>

                      <p className="text-gray-500 mb-4 text-sm leading-relaxed">
                        {plan.description}
                      </p>

                      <div className="space-y-2 text-left">
                        {plan.features?.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <FaCheckCircle className="text-emerald-500 text-sm" />
                            <span className="text-gray-700 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                    Payment History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                            User
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                            Plan
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                            Credits
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr
                            key={payment._id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >
                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                              {payment.userId?.name || "Unknown"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {payment.planId || "Unknown"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 font-semibold">
                              ₹{payment.amount}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800">
                              {payment.credits}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(payment.status)}`}
                              >
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Contact Modal */}
      <AnimatePresence>
        {viewingContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  View Inquiry
                </h2>
                <button
                  onClick={() => setViewingContact(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    Name
                  </p>
                  <p className="text-gray-800">{viewingContact.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    Email
                  </p>
                  <p className="text-gray-800">{viewingContact.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    Subject
                  </p>
                  <p className="text-gray-800">{viewingContact.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    Message
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {viewingContact.message}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    Status
                  </p>
                  <div className="flex gap-2">
                    {["new", "in_progress", "resolved"].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleUpdateContactStatus(viewingContact._id, status)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${viewingContact.status === status ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setViewingContact(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plan Modal */}
      <AnimatePresence>
        {planModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingPlan ? "Edit Plan" : "Add New Plan"}
                </h2>
                <button
                  onClick={() => setPlanModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handlePlanSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                    placeholder="e.g., Pro Pack"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={planForm.price}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Credits
                    </label>
                    <input
                      type="number"
                      required
                      value={planForm.credits}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          credits: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={planForm.order}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          order: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={planForm.description}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                    rows={3}
                    placeholder="Plan description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Features (one per line)
                  </label>
                  <textarea
                    value={planForm.features.join("\n")}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        features: e.target.value
                          .split("\n")
                          .filter((f) => f.trim()),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                    rows={5}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Badge (optional)
                  </label>
                  <input
                    type="text"
                    value={planForm.badge}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, badge: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none"
                    placeholder="e.g., Popular"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={planForm.isDefault}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, isDefault: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="isDefault"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Set as Default Plan
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setPlanModalOpen(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition cursor-pointer"
                  >
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Admin;
