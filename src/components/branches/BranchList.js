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
    FiMapPin,
    FiHome
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import { getBranches } from "../../services/branchService";

import "../../css/BranchList.css";

function BranchList() {

    const navigate = useNavigate();

    const [branches, setBranches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchBranches = async (
        showRefreshLoader = false
    ) => {

        try {

            setError("");

            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getBranches();

            const normalizedBranches =
                Array.isArray(data)
                    ? data.map((branch) => {

                        const company =
                            branch.companyId;

                        return {
                            id: branch._id,
                            name: branch.name || "",
                            address: branch.address || "",
                            contactNo:
                                branch.contactNo || "",

                            companyId:
                                typeof company === "object"
                                    ? company?._id
                                    : company,

                            companyName:
                                typeof company === "object"
                                    ? company?.name || ""
                                    : "",

                            createdAt:
                                branch.createdAt,

                            updatedAt:
                                branch.updatedAt,
                        };
                    })
                    : [];

            setBranches(normalizedBranches);

        } catch (err) {

            console.error(
                "Error fetching branches:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load branches. Please try again."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const filteredBranches = useMemo(() => {

        const search =
            searchTerm.toLowerCase().trim();

        return branches.filter((branch) => {

            if (!search) {
                return true;
            }

            return (
                branch.name
                    ?.toLowerCase()
                    .includes(search) ||

                branch.companyName
                    ?.toLowerCase()
                    .includes(search) ||

                branch.contactNo
                    ?.toLowerCase()
                    .includes(search) ||

                branch.address
                    ?.toLowerCase()
                    .includes(search)
            );
        });

    }, [branches, searchTerm]);

    const handleRefresh = () => {

        setSearchTerm("");
        setOpenMenuId(null);

        fetchBranches(true);
    };

    const handleView = (branchId) => {

        navigate(`/branches/${branchId}`);

        setOpenMenuId(null);
    };

    const handleEdit = (branchId) => {

        navigate(`/branches/edit/${branchId}`);

        setOpenMenuId(null);
    };

    const handleAddBranch = () => {
        navigate("/branches/add");
    };

    if (loading) {

        return (
            <div className="sf-branch-page">

                <div className="sf-branch-page-header">

                    <div>
                        <h1>Branches</h1>

                        <p>
                            Manage branches and their company hierarchy.
                        </p>
                    </div>

                </div>

                <div className="sf-branch-card">

                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                        }}
                    >
                        Loading branches...
                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="sf-branch-page">

            {/* HEADER */}

            <div className="sf-branch-page-header">

                <div>

                    <h1>
                        Branches
                    </h1>

                    <p>
                        Manage branches and their company hierarchy.
                    </p>

                </div>

                <button
                    className="sf-branch-add-button"
                    onClick={handleAddBranch}
                >
                    <FiPlus />

                    <span>
                        Add Branch
                    </span>
                </button>

            </div>

            {error && (
                <div
                    className="sf-branch-error"
                    style={{
                        marginBottom: "16px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* TOOLBAR */}

            <div className="sf-branch-toolbar">

                <div className="sf-branch-search">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search branches..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />

                </div>

                <button
                    className="sf-branch-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh"
                >

                    <FiRefreshCw
                        className={
                            refreshing
                                ? "sf-branch-refreshing"
                                : ""
                        }
                    />

                    <span>
                        Refresh
                    </span>

                </button>

            </div>

            {/* CARD */}

            <div className="sf-branch-card">

                <div className="sf-branch-card-header">

                    <div>

                        <h2>
                            All Branches
                        </h2>

                        <span>
                            {filteredBranches.length}{" "}
                            branches
                        </span>

                    </div>

                </div>

                {filteredBranches.length > 0 ? (

                    <div className="sf-branch-table-wrapper">

                        <table className="sf-branch-table">

                            <thead>

                                <tr>

                                    <th>
                                        Branch
                                    </th>

                                    <th>
                                        Company
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Address
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredBranches.map(
                                    (branch, index) => (

                                        <tr
                                            key={branch.id}
                                            className={
                                                openMenuId ===
                                                    branch.id &&
                                                    index >=
                                                    filteredBranches.length -
                                                    2
                                                    ? "sf-branch-menu-up"
                                                    : ""
                                            }
                                        >

                                            {/* BRANCH */}

                                            <td>

                                                <div className="sf-branch-identity">

                                                    <div className="sf-branch-avatar">

                                                        {branch.name
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                            "B"}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {branch.name ||
                                                                "Unnamed Branch"}
                                                        </strong>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* COMPANY */}

                                            <td>

                                                <div className="sf-branch-company">
                                                    
                                                    <FiHome />

                                                    <span>
                                                        {branch.companyName ||
                                                            "—"}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* CONTACT */}

                                            <td>

                                                <div className="sf-branch-contact">

                                                    {branch.contactNo ||
                                                        "—"}

                                                </div>

                                            </td>

                                            {/* ADDRESS */}

                                            <td>

                                                <div className="sf-branch-address">

                                                    {branch.address ||
                                                        "—"}

                                                </div>

                                            </td>

                                            {/* ACTIONS */}

                                            <td className="sf-branch-actions-cell">

                                                <button
                                                    className="sf-branch-menu-button"
                                                    onClick={() =>
                                                        setOpenMenuId(
                                                            openMenuId ===
                                                                branch.id
                                                                ? null
                                                                : branch.id
                                                        )
                                                    }
                                                >

                                                    <FiMoreVertical />

                                                </button>

                                                {openMenuId ===
                                                    branch.id && (

                                                        <div className="sf-branch-action-menu">

                                                            <button
                                                                onClick={() =>
                                                                    handleView(
                                                                        branch.id
                                                                    )
                                                                }
                                                            >
                                                                <FiEye />
                                                                <span>
                                                                    View
                                                                </span>
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        branch.id
                                                                    )
                                                                }
                                                            >
                                                                <FiEdit2 />
                                                                <span>
                                                                    Edit
                                                                </span>
                                                            </button>

                                                        </div>

                                                    )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="sf-branch-empty">

                        <div className="sf-branch-empty-icon">

                            <FiMapPin />

                        </div>

                        <h3>
                            No branches found
                        </h3>

                        <p>
                            Try changing your search.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}

export default BranchList;