
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiMoreVertical,
    FiEye,
    FiEdit2,
    FiPower,
    FiUser,
    FiShield,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import {
    getUsers,
    updateUserStatus,
} from "../../services/userService";

import "../../css/UserList.css";
import { usePermission } from "../../context/PermissionContext";


function UserList() {

    const navigate = useNavigate();

    const {
        hasPermission,
        loading: permissionsLoading
    } = usePermission();

    const canViewUsers =
        !permissionsLoading && hasPermission("User", "canView");

    const canAddUsers =
        !permissionsLoading && hasPermission("User", "canAdd");

    const canEditUsers =
        !permissionsLoading && hasPermission("User", "canEdit");

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);

    const isWebMaster =
        localStorage.getItem("role") === "WebMaster";

    const canChangeUserStatus =
        isWebMaster && canEditUsers;

    const fetchUsers = async (showRefreshLoader = false) => {

        try {

            setError("");

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getUsers();

            const normalizedUsers =
                Array.isArray(data)
                    ? data.map((user) => {

                        const userType = user.userTypeId;

                        return {
                            id: user._id,
                            name: user.name || "",
                            username: user.username || "",
                            email: user.email || "",
                            phoneNo: user.phoneNo || "",
                            address: user.address || "",

                            role:
                                typeof userType === "object"
                                    ? userType?.name || ""
                                    : "",

                            status: user.status || "active",
                            createdAt: user.createdAt,
                        };
                    })
                    : [];

            setUsers(normalizedUsers);

        } catch (err) {

            console.error("Error fetching users:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load users. Please try again."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };

    useEffect(() => {
        if (!permissionsLoading && canViewUsers) {
            fetchUsers();
        }
    }, [permissionsLoading, canViewUsers]);

    const filteredUsers = useMemo(() => {

        const search = searchTerm.toLowerCase().trim();

        return users.filter((user) => {

            if (!search) {
                return true;
            }

            return (
                user.name?.toLowerCase().includes(search) ||
                user.username?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search) ||
                user.phoneNo?.toLowerCase().includes(search) ||
                user.role?.toLowerCase().includes(search)
            );
        });

    }, [users, searchTerm]);

    const handleRefresh = () => {
        setSearchTerm("");
        setOpenMenuId(null);
        fetchUsers(true);
    };

    const handleView = (userId) => {
        navigate(`/user/${userId}`);
        setOpenMenuId(null);
    };

    const handleEdit = (userId) => {
        navigate(`/user/edit/${userId}`);
        setOpenMenuId(null);
    };

    const handleAddUser = () => {
        navigate("/user/add");
    };

    const handleUserStatusChange = async (user) => {

        const newStatus =
            user.status === "active" ? "inactive" : "active";

        const action =
            newStatus === "active" ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} "${user.name}"?`
        );

        if (!confirmed) return;

        try {

            setStatusUpdatingId(user.id);
            setError("");

            const response = await updateUserStatus(
                user.id,
                newStatus
            );

            setUsers((prevUsers) =>
                prevUsers.map((item) =>
                    item.id === user.id
                        ? {
                            ...item,
                            status: response.user?.status || newStatus,
                        }
                        : item
                )
            );

        } catch (err) {

            console.error("Error updating user status:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update user status. Please try again."
            );

        } finally {
            setStatusUpdatingId(null);
        }
    };

    if (permissionsLoading) {
        return (
            <div className="sf-user-page">
                <div className="sf-user-card">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        Checking permissions...
                    </div>
                </div>
            </div>
        );
    }

    if (!canViewUsers) {
        return (
            <div className="sf-user-page">
                <div className="sf-user-card">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <h2>Access Denied</h2>
                        <p>You don't have permission to view Users.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="sf-user-page">

                <div className="sf-user-page-header">
                    <div>
                        <h1>Users</h1>
                        <p>Manage system users and their access.</p>
                    </div>
                </div>

                <div className="sf-user-card">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        Loading users...
                    </div>
                </div>

            </div>
        );
    }

    return (
        <div className="sf-user-page">

            {/* HEADER */}

            <div className="sf-user-page-header">

                <div>
                    <h1>Users</h1>
                    <p>Manage system users and their access.</p>
                </div>

                {canAddUsers && (
                    <button
                        className="sf-user-add-button"
                        onClick={handleAddUser}
                    >
                        <FiPlus />
                        <span>Add User</span>
                    </button>
                )}

            </div>

            {error && (
                <div className="sf-user-error" style={{ marginBottom: "16px" }}>
                    {error}
                </div>
            )}

            {/* TOOLBAR */}

            <div className="sf-user-toolbar">

                <div className="sf-user-search">
                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    className="sf-user-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh"
                >
                    <FiRefreshCw
                        className={refreshing ? "sf-user-refreshing" : ""}
                    />
                    <span>Refresh</span>
                </button>

            </div>

            {/* CARD */}

            <div className="sf-user-card">

                <div className="sf-user-card-header">
                    <div>
                        <h2>All Users</h2>
                        <span>{filteredUsers.length} users</span>
                    </div>
                </div>

                {filteredUsers.length > 0 ? (

                    <div className="sf-user-table-wrapper">

                        <table className="sf-user-table">

                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredUsers.map((user, index) => (

                                    <tr
                                        key={user.id}
                                        className={
                                            openMenuId === user.id &&
                                            index >= filteredUsers.length - 2
                                                ? "sf-user-menu-up"
                                                : ""
                                        }
                                    >

                                        <td>
                                            <div className="sf-user-identity">

                                                <div className="sf-user-avatar">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </div>

                                                <div>
                                                    <strong>{user.name || "Unnamed User"}</strong>
                                                    <span>{user.email || "—"}</span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>{user.username || "—"}</td>

                                        <td>
                                            <div className="sf-user-role">
                                                <FiShield />
                                                <span>{user.role || "—"}</span>
                                            </div>
                                        </td>

                                        <td>{user.phoneNo || "—"}</td>

                                        <td>
                                            <span
                                                className={`sf-dealer-status-badge ${
                                                    user.status?.toLowerCase() === "active"
                                                        ? "active"
                                                        : user.status?.toLowerCase() === "pending"
                                                            ? "pending"
                                                            : "inactive"
                                                }`}
                                            >
                                                <span className="sf-dealer-status-dot"></span>
                                                {user.status?.charAt(0).toUpperCase() +
                                                    user.status?.slice(1)}
                                            </span>
                                        </td>

                                        <td className="sf-user-actions-cell">

                                            <button
                                                className="sf-user-menu-button"
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId === user.id
                                                            ? null
                                                            : user.id
                                                    )
                                                }
                                            >
                                                <FiMoreVertical />
                                            </button>

                                            {openMenuId === user.id && (

                                                <div className="sf-user-action-menu">

                                                    {canViewUsers && (
                                                        <button onClick={() => handleView(user.id)}>
                                                            <FiEye />
                                                            <span>View</span>
                                                        </button>
                                                    )}

                                                    {canEditUsers && (
                                                        <button onClick={() => handleEdit(user.id)}>
                                                            <FiEdit2 />
                                                            <span>Edit</span>
                                                        </button>
                                                    )}

                                                    {canChangeUserStatus && (
                                                        <button
                                                            onClick={() => handleUserStatusChange(user)}
                                                            disabled={statusUpdatingId === user.id}
                                                        >
                                                            <FiPower />
                                                            <span>
                                                                {statusUpdatingId === user.id
                                                                    ? "Updating..."
                                                                    : user.status === "active"
                                                                        ? "Deactivate"
                                                                        : "Activate"}
                                                            </span>
                                                        </button>
                                                    )}

                                                </div>
                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="sf-user-empty">

                        <div className="sf-user-empty-icon">
                            <FiUser />
                        </div>

                        <h3>No users found</h3>
                        <p>Try changing your search.</p>

                    </div>

                )}

            </div>

        </div>
    );
}

export default UserList;
