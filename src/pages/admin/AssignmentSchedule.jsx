import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiLoader,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { getMySchedules, updateSchedule } from "../../services/scheduleService";
import { getMe } from "../../services/authService";

export default function AssignmentSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // --- Phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // ✅ Lấy user hiện tại
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch (err) {
        Swal.fire("Lỗi", "Không thể tải thông tin người dùng", "error");
      }
    };
    fetchUser();
  }, []);

  // ✅ Lấy danh sách lịch được phân công cho user hiện tại + polling
  useEffect(() => {
    if (!user) return;
    const fetchSchedules = async () => {
  try {
    const data = await getMySchedules(); 
    console.log("📌 MySchedules API data:", data); // 👈 thêm log debug
    setSchedules(data); // không cần lọc nữa
  } catch (err) {
    Swal.fire("Lỗi", "Không thể tải danh sách lịch hẹn", "error");
  } finally {
    setTimeout(() => setLoaded(true), 200);
  }
};



    fetchSchedules();
    const interval = setInterval(fetchSchedules, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Khi dữ liệu thay đổi thì quay về trang 1 để tránh vượt quá tổng trang
  useEffect(() => {
    setCurrentPage(1);
  }, [schedules]);

  // ✅ Update trạng thái (SweetAlert confirm)
  async function handleUpdateStatus(id, status, text) {
    const result = await Swal.fire({
      title: `Xác nhận ${text}?`,
      text: `Bạn có chắc chắn muốn ${text.toLowerCase()} lịch hẹn này không?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Có, ${text}`,
      cancelButtonText: "Hủy",
      confirmButtonColor: status === "canceled" ? "#dc2626" : "#16a34a",
    });

    if (!result.isConfirmed) return;

    try {
      const updated = await updateSchedule(id, { status });
      setSchedules((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      Swal.fire("Thành công", `Lịch hẹn đã ${text.toLowerCase()}`, "success");
    } catch (err) {
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái", "error");
    }
  }

  // ✅ Render trạng thái
  function renderStatus(status) {
    if (status === "done")
      return (
        <span className="status confirmed">
          <FiCheckCircle /> Đã hoàn thành
        </span>
      );
    if (status === "canceled")
      return (
        <span className="status canceled">
          <FiXCircle /> Đã hủy
        </span>
      );
    if (status === "accepted")
      return (
        <span className="status accepted">
          <FiCheckCircle /> Đã chấp nhận
        </span>
      );
    if (status === "assigned")
      return (
        <span className="status assigned">
          <FiUser /> Đang chờ chấp nhận
        </span>
      );
    return (
      <span className="status pending">
        <FiLoader /> Chờ xử lý
      </span>
    );
  }

  // --- Sắp xếp & cắt trang ---
  const sorted = schedules
    .slice()
    .sort((a, b) => {
      const order = {
        pending: 1,
        assigned: 2,
        accepted: 3,
        done: 4,
        canceled: 5,
      };
      return (order[a.status] || 99) - (order[b.status] || 99);
    });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(pageStart, pageStart + pageSize);

  // --- Helpers chuyển trang ---
  const goToPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));
  const prev = () => goToPage(currentPage - 1);
  const next = () => goToPage(currentPage + 1);

  // Hiển thị tối đa 5 nút số trang (cửa sổ trượt)
  const getVisiblePages = () => {
    const max = 5;
    if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, currentPage - 2);
    let end = start + max - 1;
    if (end > totalPages) {
      end = totalPages;
      start = end - max + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      <div className={`dashboard ${loaded ? "loaded" : ""}`}>
        <div className="title-box">
          <FiCalendar className="title-icon" />
          <h1 className="title">📅 Lịch hẹn của tôi</h1>
        </div>

        <div className="table-container">
          {schedules.length === 0 ? (
            <p style={{ padding: 20, color: "#6b7280", textAlign: "center" }}>
              Không có lịch hẹn nào được phân công cho bạn.
            </p>
          ) : (
            <>
              <table className="animated-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Khách hàng</th>
                    <th>SĐT</th>
                    <th>Phòng</th>
                    <th>Lịch hẹn</th>
                    <th>Ghi chú</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {pageItems.map((s, index) => (
                    <tr
                      key={s._id}
                      className={`row-animate ${loaded ? "show" : ""}`}
                      style={{ animationDelay: `${index * 0.12}s` }}
                    >
                      {/* STT theo toàn danh sách */}
                      <td className="stt">{pageStart + index + 1}</td>
                      <td>{s.customer_name}</td>
                      <td>{s.customer_phone}</td>

                      {/* Cột phòng */}
                      <td>
                        {s.room_id ? (
                          <a
                            href={`/admin/room/${s.room_id._id}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              textDecoration: "none",
                              color: "#4f46e5",
                              fontWeight: "600",
                            }}
                          >
                           <span>{s.room_id?.apartmentName || "Xem phòng"}</span>
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Cột lịch hẹn */}
                      <td>
                        <div className="schedule-cell">
                          <span className="date">
                            {new Date(s.scheduled_time).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="time">
                            {new Date(s.scheduled_time).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      <td>{s.note || "—"}</td>
                      <td>{renderStatus(s.status)}</td>

                      {/* Cột hành động */}
                      <td>
                        {s.status === "assigned" && (
                          <div className="action-btns">
                            <button
                              className="btn-accept"
                              onClick={() => handleUpdateStatus(s._id, "accepted", "Chấp nhận")}
                            >
                              🤝 Chấp nhận
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={() => handleUpdateStatus(s._id, "canceled", "Hủy")}
                            >
                              ❌ Hủy
                            </button>
                          </div>
                        )}

                        {s.status === "accepted" && (
                          <div className="action-btns">
                            <button
                              className="btn-done"
                              onClick={() => handleUpdateStatus(s._id, "done", "Hoàn thành")}
                            >
                              ✅ Hoàn thành
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={() => handleUpdateStatus(s._id, "canceled", "Hủy")}
                            >
                              ❌ Hủy
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination">
                <button
                  className="page-btn square"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  aria-label="Trang đầu"
                >
                  «
                </button>
                <button
                  className="page-btn square"
                  onClick={prev}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                >
                  ‹
                </button>

                {getVisiblePages().map((p) => (
                  <button
                    key={p}
                    className={`page-btn number ${p === currentPage ? "active" : ""}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="page-btn square"
                  onClick={next}
                  disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                >
                  ›
                </button>
                <button
                  className="page-btn square"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  aria-label="Trang cuối"
                >
                  »
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 40px;
          min-height: 100vh;
          background: linear-gradient(135deg, #f9fafb, #eef2ff);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .dashboard.loaded { opacity: 1; transform: translateY(0); }

        .title-box {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 30px; padding: 20px 28px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          color: white;
          animation: fadeInDown 0.8s ease;
        }
        .title-icon { font-size: 32px; }
        .title { font-size: 26px; font-weight: 800; }

        .table-container { 
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          overflow-x: auto;
          padding: 20px;
          animation: fadeInUp 0.8s ease;
        }

        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 16px 20px; text-align: left; font-size: 14px; }
        th { background: #f9fafb; font-weight: 700; color: #374151; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; }

        .stt { font-weight: 700; color: #4f46e5; text-align: center; }

        .row-animate { opacity: 0; transform: translateY(20px); }
        .row-animate.show { animation: rowFadeIn 0.6s forwards; }

        @keyframes rowFadeIn { 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .schedule-cell { display: flex; flex-direction: column; gap: 4px; }
        .date { font-weight: 600; color: #1f2937; }
        .time { font-size: 13px; color: #6b7280; }

        .status { padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .status.confirmed { background: #dcfce7; color: #15803d; }
        .status.accepted { background: #f0fdf4; color: #16a34a; }
        .status.assigned { background: #dbeafe; color: #1d4ed8; }
        .status.pending { background: #fef9c3; color: #a16207; }
        .status.canceled { background: #fee2e2; color: #b91c1c; }

        .action-btns { display: flex; gap: 8px; }
        .btn-accept, .btn-done, .btn-cancel {
          padding: 8px 14px; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.3s;
          font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-accept { background: #2563eb; color: white; }
        .btn-done { background: #16a34a; color: white; }
        .btn-cancel { background: #dc2626; color: white; }
        .btn-accept:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .btn-done:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
        .btn-cancel:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(220,38,38,0.3); }

        /* Pagination */
        .pagination {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: center;
          margin-top: 18px;
          padding-top: 12px;
          border-top: 1px solid #eef2ff;
        }
        .page-btn {
          min-width: 44px;
          height: 38px;
          padding: 0 12px;
          border: 1.5px solid #8b5cf6;
          background: white;
          color: #6d28d9;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
        }
        .page-btn.number.active {
          background: #7c3aed;
          color: white;
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
          border-color: transparent;
        }
        .page-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .page-btn:disabled { opacity: .4; cursor: not-allowed; }
        .page-btn.square { width: 44px; padding: 0; }
      `}</style>
    </>
  );
}
