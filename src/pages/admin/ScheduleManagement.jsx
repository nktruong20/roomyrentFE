import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiUserCheck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { getSchedules, updateSchedule } from "../../services/scheduleService";
import { getStaff } from "../../services/authService";

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [notes, setNotes] = useState({});
  const [loaded, setLoaded] = useState(false);

  // ===== Pagination =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ Lấy danh sách lịch từ backend + Polling 5s
  useEffect(() => {
    let mounted = true;

    const fetchSchedules = async () => {
      try {
        const data = await getSchedules();
        console.log("📥 API trả về danh sách lịch:", data);
        if (!mounted) return;
        setSchedules(data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách lịch:", err);
        Swal.fire("Lỗi", "Không thể tải danh sách lịch hẹn", "error");
      } finally {
        if (mounted) setTimeout(() => setLoaded(true), 200);
      }
    };

    fetchSchedules();
    const interval = setInterval(fetchSchedules, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // ✅ Lấy danh sách nhân sự (1 lần)
  useEffect(() => {
    let mounted = true;
    const fetchStaff = async () => {
      try {
        const data = await getStaff();
        if (mounted) setStaff(data || []);
      } catch (err) {
        Swal.fire("Lỗi", "Không thể tải danh sách nhân sự", "error");
      }
    };
    fetchStaff();
    return () => (mounted = false);
  }, []);

  // ✅ Khi danh sách thay đổi -> về trang 1 để thấy bản ghi mới
  useEffect(() => {
    setCurrentPage(1);
  }, [schedules.length]);

  // ✅ Scroll lên trên khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  function openAssignModal(scheduleId) {
    setSelectedSchedule(scheduleId);
  }
  function closeModal() {
    setSelectedSchedule(null);
  }

  // ✅ Phân công
   async function handleAssign(staffId) {
    try {
      console.log("📤 Gửi request phân công:", {
        scheduleId: selectedSchedule,
        staffId,
        note: notes[selectedSchedule] || "",
      });

      const updated = await updateSchedule(selectedSchedule, {
        assigned_user_id: staffId,
        status: "assigned",
        note: notes[selectedSchedule] || "",
      });

      console.log("✅ API trả về sau phân công:", updated);

      setSchedules((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );

      Swal.fire("Thành công", "Phân công nhân sự thành công", "success");
    } catch (err) {
      console.error("❌ Lỗi khi phân công:", err);
      Swal.fire("Lỗi", "Không thể phân công", "error");
    } finally {
      closeModal();
    }
  }


  // ✅ Hủy lịch
  async function handleCancel(scheduleId) {
    const result = await Swal.fire({
      title: "Xác nhận hủy?",
      text: "Bạn có chắc chắn muốn hủy lịch hẹn này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, hủy",
      cancelButtonText: "Không",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    try {
      const updated = await updateSchedule(scheduleId, { status: "canceled" });
      setSchedules((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      Swal.fire("Đã hủy", "Lịch hẹn đã được hủy bỏ", "success");
    } catch (err) {
      Swal.fire("Lỗi", "Không thể hủy lịch", "error");
    }
  }

  // ===== Helper: lấy timestamp fallback =====
  const getTimeFromObjectId = (id = "") => {
    try {
      return parseInt(id.substring(0, 8), 16) * 1000;
    } catch {
      return 0;
    }
  };

  const getCompletionTime = (s) => {
    const t =
      s.completed_at ||
      s.completedAt ||
      s.updatedAt ||
      s.scheduled_time ||
      getTimeFromObjectId(s._id);
    return new Date(t).getTime();
  };

  // ===== Sắp xếp: nhóm "done" mới nhất lên trước, sau đó các trạng thái khác theo thứ tự =====
 // ===== Sắp xếp: theo thứ tự trạng thái cố định =====
const statusOrder = { pending: 1, assigned: 2, accepted: 3, done: 4, canceled: 5 };

const sorted = schedules.slice().sort((a, b) => {
  const ao = statusOrder[a.status] || 99;
  const bo = statusOrder[b.status] || 99;

  if (ao !== bo) return ao - bo;

  // Nếu cùng trạng thái thì sắp xếp theo thời gian mới nhất trước
  return new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime();
});


  // ===== Cắt trang =====
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageItems = sorted.slice(pageStart, pageStart + itemsPerPage);

  // ===== Pagination helpers =====
  const goToPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));
  const prev = () => goToPage(currentPage - 1);
  const next = () => goToPage(currentPage + 1);

  // Tối đa 5 nút số trang
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
          <FiUserCheck /> Nhân sự đã chấp nhận
        </span>
      );
    if (status === "assigned")
      return (
        <span className="status assigned">
          <FiUserCheck /> Đã phân công (chờ nhân sự)
        </span>
      );
    return (
      <span className="status pending">
        <FiLoader /> Chờ xử lý
      </span>
    );
  }

  return (
    <>
      <div className={`dashboard ${loaded ? "loaded" : ""}`}>
        <div className="title-box">
          <FiCalendar className="title-icon" />
          <h1 className="title">Quản lý lịch hẹn</h1>
        </div>

        <div className="table-container fade-in-up">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Phòng</th>
                <th>Lịch hẹn</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
                <th>Phân công</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.map((s, index) => (
                <tr
                  key={s._id}
                  className={`row-animate ${loaded ? "show" : ""}`}
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <td>{s.customer_name}</td>
                  <td>{s.customer_phone}</td>

                  {/* Cột phòng */}
                  <td>
                    {s.room_id ? (
                      <a
                        href={`/admin/room/${s.room_id._id}`}
                        style={{ color: "#4f46e5", fontWeight: "600" }}
                      >
                        {s.room_id.title || "Xem phòng"}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Lịch hẹn */}
                  <td>
                    <div className="schedule-cell">
                      <span className="date">
                        <FiCalendar />{" "}
                        {new Date(s.scheduled_time).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="time">
                        <FiClock />{" "}
                        {new Date(s.scheduled_time).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td>{renderStatus(s.status)}</td>

                  {/* Ghi chú */}
                  <td>{s.note || "—"}</td>

                  {/* Phân công / hành động */}
                  <td>
                    {s.status === "pending" && (
                      <div className="action-buttons">
                        <button className="assign-btn" onClick={() => openAssignModal(s._id)}>
                          <FiUserCheck /> Phân công
                        </button>
                        <button className="cancel-btn" onClick={() => handleCancel(s._id)}>
                          ❌ Hủy lịch
                        </button>
                      </div>
                    )}

                    {s.status === "assigned" && (
                      <div className="assigned">
                        <span>⏳ Đã phân công - chờ nhân sự chấp nhận</span>
                      </div>
                    )}

                    {s.status === "accepted" && (
                      <div className="assigned">
                        <span>✅ Nhân sự đã chấp nhận</span>
                      </div>
                    )}

                    {s.status === "done" && (
                      <button className="done-btn" disabled>
                        <FiCheckCircle /> Hoàn thành
                      </button>
                    )}

                    {s.status === "canceled" && (
                      <button className="cancel-btn" disabled>
                        <FiXCircle /> Đã hủy
                      </button>
                    )}

                    {s.assigned_user_id && s.status !== "done" && s.status !== "canceled" && (
                      <div className="assigned">
                        <img
                          src={s.assigned_user_id.avatar || "https://i.pravatar.cc/40"}
                          alt={s.assigned_user_id.name}
                        />
                        <span>{s.assigned_user_id.name}</span>
                        <small>({s.assigned_user_id.role})</small>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination đẹp */}
          <div className="pagination pretty">
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

          {/* Info nhỏ */}
          <div className="page-info">
            Hiển thị{" "}
            <b>
              {sorted.length === 0 ? 0 : `${pageStart + 1}–${Math.min(pageStart + itemsPerPage, sorted.length)}`}
            </b>{" "}
            / <b>{sorted.length}</b> lịch hẹn
          </div>
        </div>
      </div>

      {/* Modal phân công */}
      {selectedSchedule && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Phân công nhân sự</h2>
            <p>Chọn người phụ trách dẫn khách đi xem phòng:</p>
            <div className="staff-list">
              {staff.map((st) => (
                <div key={st._id} className="staff-card" onClick={() => handleAssign(st._id)}>
                  <img src={st.avatar || "https://i.pravatar.cc/40"} alt={st.name} />
                  <div className="staff-info">
                    <span>{st.name}</span>
                    <small>{st.role === "admin" ? "👑 Admin" : "🧑 Assistant"}</small>
                  </div>
                </div>
              ))}
            </div>
            <textarea
              placeholder="Ghi chú thêm..."
              value={notes[selectedSchedule] || ""}
              onChange={(e) =>
                setNotes((prev) => ({
                  ...prev,
                  [selectedSchedule]: e.target.value,
                }))
              }
            />
            <button className="close-btn" onClick={closeModal}>
              Đóng
            </button>
          </div>
        </div>
      )}

      <style>{`
        body { background: #f9fafb; font-family: "Inter", sans-serif; }
        .dashboard { padding: 40px; min-height: 100vh; opacity: 0; transform: translateY(20px); transition: all 0.6s ease; }
        .dashboard.loaded { opacity: 1; transform: translateY(0); }

        .title-box {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 30px; padding: 20px;
          background: linear-gradient(to right, #fdf4ff, #eef2ff);
          border-radius: 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          animation: fadeInDown 0.8s ease;
        }
        .title-icon { font-size: 28px; color: #7c3aed; }
        .title { font-size: 24px; font-weight: 800; background: linear-gradient(to right,#7c3aed,#4338ca);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .table-container { background: white; border-radius: 20px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08); overflow-x: auto; padding: 20px; animation: fadeInUp 1s ease; }
        .fade-in-up { animation: fadeInUp .6s ease both; }

        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 14px 18px; text-align: left; font-size: 14px; }
        th { background: #f9fafb; font-weight: 600; color: #374151; text-transform: uppercase; font-size: 13px; }

        .row-animate { opacity: 0; transform: translateY(20px); }
        .row-animate.show { animation: rowFadeIn 0.6s forwards; }

        @keyframes rowFadeIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .schedule-cell { display: flex; flex-direction: column; gap: 6px; }
        .schedule-cell .date, .schedule-cell .time {
          padding: 5px 10px; border-radius: 8px; font-size: 13px;
          font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
        }
        .schedule-cell .date { background: #eef2ff; color: #4338ca; }
        .schedule-cell .time { background: #ecfdf5; color: #047857; }

        .status { padding: 6px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .status.confirmed { background: #dcfce7; color: #15803d; }
        .status.accepted { background: #f0fdf4; color: #16a34a; }
        .status.assigned { background: #dbeafe; color: #1d4ed8; }
        .status.pending { background: #fef9c3; color: #a16207; }
        .status.canceled { background: #fee2e2; color: #b91c1c; }

        .action-buttons { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .assign-btn, .done-btn, .cancel-btn {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; padding: 8px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.25s ease;
        }
        .assign-btn { background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; }
        .assign-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 16px rgba(124,58,237,0.3); }
        .done-btn { background: linear-gradient(to right, #22c55e, #16a34a); color: white; }
        .done-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 16px rgba(34,197,94,0.3); }
        .cancel-btn { background: #ef4444; color: white; }
        .cancel-btn:hover { background: #dc2626; transform: translateY(-2px); }

        .assigned { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12px; color: #6b7280; }
        .assigned img { width: 24px; height: 24px; border-radius: 50%; }

        /* Pagination đẹp */
        .pagination.pretty{
          display:flex; gap:10px; align-items:center; justify-content:center;
          margin-top:16px; padding-top:12px; border-top:1px solid #eef2ff;
        }
        .page-btn{
          min-width:44px; height:38px; padding:0 12px;
          border:1.5px solid #8b5cf6; background:#fff; color:#6d28d9;
          border-radius:10px; font-weight:700; cursor:pointer;
          transition:transform .15s ease, box-shadow .2s ease, background .2s ease;
        }
        .page-btn:hover:not(:disabled){ transform: translateY(-1px); }
        .page-btn:disabled{ opacity:.4; cursor:not-allowed; }
        .page-btn.square{ width:44px; padding:0; }
        .page-btn.number.active{
          background:#7c3aed; color:#fff; border-color:transparent;
          box-shadow:0 6px 16px rgba(124,58,237,.35);
        }

        .page-info{
          text-align:center; font-size:13px; color:#6b7280; margin:8px 0 2px;
        }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; z-index: 50; }
        .modal { background: white; padding: 30px; border-radius: 20px;
          max-width: 480px; width: 100%; text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: scaleIn 0.3s ease; }
        .modal h2 { margin-bottom: 10px; font-size: 22px; font-weight: 700; color: #111827; }
        .modal p { color: #6b7280; margin-bottom: 20px; }
        .staff-list { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
        .staff-card { display: flex; align-items: center; gap: 12px; padding: 12px;
          border-radius: 12px; background: #f9fafb; cursor: pointer;
          font-weight: 600; color: #374151; transition: all 0.2s ease; }
        .staff-card:hover { background: #ede9fe; color: #5b21b6; transform: translateY(-2px) scale(1.02); }
        .staff-card img { width: 40px; height: 40px; border-radius: 50%; }
        .staff-info { display: flex; flex-direction: column; align-items: flex-start; }
        textarea { width: 100%; min-height: 80px; border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 10px; font-size: 14px; margin-top: 10px; margin-bottom: 20px;
          resize: none; outline: none; transition: all 0.2s ease; }
        textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.25); }
        .close-btn { background: #ef4444; color: white; border: none;
          padding: 10px 18px; border-radius: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; }
        .close-btn:hover { background: #dc2626; transform: translateY(-2px); }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
}
