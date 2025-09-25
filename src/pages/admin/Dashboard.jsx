import React, { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { FaMoneyCheckAlt, FaSortAmountDownAlt } from "react-icons/fa";
import { getStaffRevenue } from "../../services/authService";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedMonth, setSelectedMonth] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  // ✅ Fetch data
  useEffect(() => {
    const fetchStaffRevenue = async () => {
      try {
        const data = await getStaffRevenue();
        // Fix logic: nếu revenue = 0 thì commission = 0
        const fixed = data.map((u) => ({
          ...u,
          commission: u.revenue === 0 ? 0 : u.commission,
        }));
        setStaff(fixed);
        setFilteredStaff(fixed);
      } catch (err) {
        Swal.fire("Lỗi", err.message || "Không thể tải dữ liệu", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStaffRevenue();
  }, []);

  // ✅ Filter + sort
  useEffect(() => {
    let list = [...staff];

    if (selectedMonth) {
      list = list.map((u) => {
        const monthlyRevenue = u.monthlyRevenue?.[selectedMonth] || 0;
        return {
          ...u,
          revenue: monthlyRevenue,
          commission: monthlyRevenue === 0 ? 0 : u.commission,
        };
      });
    }

    list.sort((a, b) => (sortDesc ? b.revenue - a.revenue : a.revenue - b.revenue));

    setFilteredStaff(list);
    setCurrentPage(1);
  }, [selectedMonth, sortDesc, staff]);

  // ✅ Tổng doanh thu & hoa hồng
  const totalRevenue = filteredStaff.reduce((sum, u) => sum + (u.revenue || 0), 0);
  const totalCommission = filteredStaff.reduce(
    (sum, u) => sum + (u.commission || 0),
    0
  );

  // ✅ Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard">
      {/* Title */}
      <div className="title-box fade-down">
        <FiUsers className="title-icon pulse" />
        <h1 className="title">Quản lý hệ thống nhân sự</h1>
      </div>

      {/* Stats */}
      <div className="stats fade-up">
        <div className="stat-card">
          <FaMoneyCheckAlt className="stat-icon" />
          <div>
            <p className="stat-label">Tổng doanh thu</p>
            <h2 className="stat-value">
              {totalRevenue.toLocaleString("vi-VN")} VND
            </h2>
          </div>
        </div>
        <div className="stat-card">
          <FaMoneyCheckAlt className="stat-icon" />
          <div>
            <p className="stat-label">Tổng hoa hồng</p>
            <h2 className="stat-value">
              {totalCommission.toLocaleString("vi-VN")} VND
            </h2>
          </div>
        </div>
      </div>

      {/* Filter + Sort */}
      <div className="filter-bar fade-up">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">-- Chọn tháng --</option>
          <option value="2025-09">Tháng 9/2025</option>
          <option value="2025-08">Tháng 8/2025</option>
          <option value="2025-07">Tháng 7/2025</option>
        </select>
        <button className="sort-btn" onClick={() => setSortDesc(!sortDesc)}>
          <FaSortAmountDownAlt /> {sortDesc ? "Cao → Thấp" : "Thấp → Cao"}
        </button>
      </div>

      {/* Table */}
      <div className="table-container fade-up">
        {loading ? (
          <p className="loading">⏳ Đang tải dữ liệu...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Vai trò</th>
                  <th>Doanh thu</th>
                  <th>Hoa hồng</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.length > 0 ? (
                  paginatedStaff.map((user, index) => (
                    <tr key={user._id} className="row-anim">
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "—"}</td>
                      <td>
                        <span
                          className={`role-badge ${
                            user.role === "admin"
                              ? "admin"
                              : user.role === "assistant"
                              ? "assistant"
                              : "other"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="revenue">
                        {user.revenue?.toLocaleString("vi-VN")} VND
                      </td>
                      <td className="commission">
                        {user.commission?.toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                      ❌ Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  «
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CSS */}
      <style>{`
        body { background: #f8fafc; }
        .dashboard { padding: 40px; font-family: "Inter", sans-serif; min-height: 100vh; }
        .title-box { display: flex; align-items: center; gap: 14px; margin-bottom: 30px; padding: 22px 28px; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .title-icon { font-size: 34px; color: #7c3aed; }
        .title { font-size: 26px; font-weight: 800; color: #7c3aed; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat-card { flex: 1; background: white; border-radius: 20px; padding: 20px 28px; display: flex; align-items: center; gap: 16px; box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
        .stat-icon { font-size: 32px; color: #22c55e; }
        .stat-label { font-size: 14px; color: #6b7280; }
        .stat-value { font-size: 20px; font-weight: 800; color: #111827; }
        .filter-bar { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 20px; }
        .filter-bar select, .filter-bar button { padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; cursor: pointer; font-weight: 600; }
        .sort-btn { background: linear-gradient(90deg,#6366f1,#8b5cf6); color: white; border: none; display: flex; align-items: center; gap: 6px; }
        .table-container { background: white; border-radius: 20px; box-shadow: 0 8px 28px rgba(0,0,0,0.08); overflow-x: auto; padding: 25px; }
        table { width: 100%; border-collapse: collapse; animation: fadeIn 1s ease-in-out; }
        th, td { padding: 16px 20px; text-align: left; font-size: 14px; }
        th { background: #f3f4f6; font-weight: 600; color: #374151; text-transform: uppercase; font-size: 13px; }
        tbody tr { transition: all 0.25s ease; }
        tbody tr:hover { background: #f9fafb; transform: scale(1.01); box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
        td { color: #4b5563; font-size: 14px; }
        .role-badge { padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .role-badge.admin { background: #e0e7ff; color: #3730a3; }
        .role-badge.assistant { background: #fef9c3; color: #92400e; }
        .role-badge.other { background: #e5e7eb; color: #374151; }
        .revenue { font-weight: 700; color: #2563eb; }
        .commission { font-weight: 700; color: #16a34a; }
        .pagination { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
        .pagination button { padding: 6px 12px; border-radius: 8px; border: 1px solid #8b5cf6; background: #fff; color: #8b5cf6; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
        .pagination button.active { background: linear-gradient(90deg,#6366f1,#8b5cf6); color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
        .loading { text-align: center; font-size: 16px; color: #6b7280; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeIn 0.8s ease; }
        .fade-down { animation: fadeDown 0.8s ease; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .row-anim { animation: fadeIn 0.6s ease; }
      `}</style>
    </div>
  );
}
