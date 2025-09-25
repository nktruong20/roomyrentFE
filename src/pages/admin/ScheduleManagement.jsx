import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiUserCheck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiUsers,
  FiEye 
} from "react-icons/fi";
import Swal from "sweetalert2";
import {
  getSchedules,
  updateSchedule,
  checkStaffAvailability,
} from "../../services/scheduleService";
import { getStaff } from "../../services/authService";

/**
 * 📌 Schedule Management (Admin)
 * - Quản lý lịch hẹn khách hàng
 * - Phân công nhân sự có kiểm tra trùng lịch (Rảnh / Bận)
 * - Giao diện đẹp với animation
 */
export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [notes, setNotes] = useState({});
  const [availability, setAvailability] = useState({});
  const [loadingStaff, setLoadingStaff] = useState({});
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
        if (!mounted) return;
        setSchedules(data || []);
      } catch (err) {
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

  // ===== Modal =====
  async function openAssignModal(scheduleId) {
    setSelectedSchedule(scheduleId);
    const target = schedules.find((s) => s._id === scheduleId);
    if (!target) return;

    // Kiểm tra availability cho từng staff
    staff.forEach(async (st) => {
      setLoadingStaff((prev) => ({ ...prev, [st._id]: true }));
      try {
        const res = await checkStaffAvailability(st._id, target.start_time);
        setAvailability((prev) => ({
          ...prev,
          [st._id]: res.available ? "available" : "busy",
        }));
      } catch {
        setAvailability((prev) => ({ ...prev, [st._id]: "error" }));
      } finally {
        setLoadingStaff((prev) => ({ ...prev, [st._id]: false }));
      }
    });
  }

  function closeModal() {
    setSelectedSchedule(null);
    setAvailability({});
    setLoadingStaff({});
  }

  // ✅ Phân công
  async function handleAssign(staffId) {
    try {
      const updated = await updateSchedule(selectedSchedule, {
        assigned_user_id: staffId,
        status: "assigned",
        note: notes[selectedSchedule] || "",
      });

      setSchedules((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );

      Swal.fire("Thành công", "Phân công nhân sự thành công", "success");
    } catch (err) {
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
      setSchedules((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
      Swal.fire("Đã hủy", "Lịch hẹn đã được hủy bỏ", "success");
    } catch (err) {
      Swal.fire("Lỗi", "Không thể hủy lịch", "error");
    }
  }

  // ===== Sort =====
 const statusOrder = {
  pending: 1,
  assigned: 2,
  accepted: 3,
  viewed: 4,
  done: 5,
  canceled: 6,
};

// ✅ Boss cập nhật trạng thái
async function handleBossUpdate(scheduleId, status, text) {
  const result = await Swal.fire({
    title: `Xác nhận ${text}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: `Có, ${text}`,
    cancelButtonText: "Hủy",
  });
  if (!result.isConfirmed) return;

  try {
    const updated = await updateSchedule(scheduleId, { status });
    setSchedules((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s))
    );
    Swal.fire("Thành công", `Đã ${text.toLowerCase()}`, "success");
  } catch {
    Swal.fire("Lỗi", "Không thể cập nhật", "error");
  }
}


  const sorted = schedules.slice().sort((a, b) => {
    const ao = statusOrder[a.status] || 99;
    const bo = statusOrder[b.status] || 99;
    if (ao !== bo) return ao - bo;
    return (
      new Date(b.start_time).getTime() -
      new Date(a.start_time).getTime()
    );
  });

  // ===== Pagination =====
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageItems = sorted.slice(pageStart, pageStart + itemsPerPage);

  const goToPage = (p) =>
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
  const prev = () => goToPage(currentPage - 1);
  const next = () => goToPage(currentPage + 1);

  const getVisiblePages = () => {
    const max = 5;
    if (totalPages <= max)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
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
          <FiCheckCircle /> Đã hoàn tất
        </span>
      );

    if (status === "canceled")
      return (
        <span className="status canceled">
          <FiXCircle /> Đã hủy
        </span>
      );

  if (status === "viewed")
  return (
    <span className="status viewed">
      <FiEye /> Đã xem
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
          <FiUsers className="title-icon" />
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
                  <td>
                    <div className="schedule-cell">
                      <span className="date">
                        <FiCalendar />{" "}
                        {new Date(s.start_time).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="time">
                        <FiClock />{" "}
                        {new Date(s.start_time).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" }
                        )}{" "}
                        -{" "}
                        {new Date(s.end_time).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </div>
                  </td>
                  <td>{renderStatus(s.status)}</td>
                  <td>{s.note || "—"}</td>
                  <td>
  {s.status === "pending" && (
    <div className="action-icons">
      <button
        className="icon-btn assign"
        onClick={() => openAssignModal(s._id)}
        title="Phân công nhân sự"
      >
        <FiUserCheck />
      </button>
      <button
        className="icon-btn cancel"
        onClick={() => handleCancel(s._id)}
        title="Hủy lịch"
      >
        <FiXCircle />
      </button>
    </div>
  )}

 {s.assigned_user_id &&
  s.status !== "done" &&
  s.status !== "canceled" &&
  s.status !== "viewed" && (   // 👈 thêm điều kiện này
    <div className="assigned">
      <img src={s.assigned_user_id.avatar || "https://i.pravatar.cc/40"} alt={s.assigned_user_id.name} />
      <span>{s.assigned_user_id.name}</span>
      <small>({s.assigned_user_id.role})</small>
    </div>
)}



  {s.status === "viewed" && (
    <div className="action-icons">
      <button
        className="icon-btn done"
        onClick={() => handleBossUpdate(s._id, "done", "Hoàn thành")}
        title="Hoàn thành"
      >
        <FiCheckCircle />
      </button>
      <button
        className="icon-btn cancel"
        onClick={() => handleCancel(s._id)}
        title="Hủy lịch"
      >
        <FiXCircle />
      </button>
    </div>
  )}
</td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination pretty">
            <button
              className="page-btn square"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className="page-btn square"
              onClick={prev}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {getVisiblePages().map((p) => (
              <button
                key={p}
                className={`page-btn number ${
                  p === currentPage ? "active" : ""
                }`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn square"
              onClick={next}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
            <button
              className="page-btn square"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modal phân công */}
      {selectedSchedule && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Phân công nhân sự</h2>
            <p>Chọn người phụ trách:</p>
            <div className="staff-list">
              {staff.map((st) => {
                const status = availability[st._id];
                return (
                  <div
                    key={st._id}
                    className={`staff-card ${
                      status === "busy" ? "disabled" : ""
                    }`}
                    onClick={() =>
                      status === "available" && handleAssign(st._id)
                    }
                  >
                    <img
                      src={st.avatar || "https://i.pravatar.cc/40"}
                      alt={st.name}
                    />
                    <div className="staff-info">
                      <span>{st.name}</span>
                      <small>
                        {st.role === "admin" ? "👑 Admin" : "🧑 Assistant"}
                      </small>
                    </div>
                    {loadingStaff[st._id] && (
                      <span style={{ color: "#6b7280", fontSize: 12 }}>
                        ⏳ Đang kiểm tra...
                      </span>
                    )}
                    {status === "busy" && (
                      <span style={{ color: "red", fontSize: 12 }}>Đã có lịch</span>
                    )}
                    {status === "available" && (
                      <span style={{ color: "green", fontSize: 12 }}>
                        Đang trống
                      </span>
                    )}
                    {status === "error" && (
                      <span style={{ color: "orange", fontSize: 12 }}>
                        Lỗi
                      </span>
                    )}
                  </div>
                );
              })}
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
        body { background:#f9fafb; font-family:"Inter",sans-serif; }
        .dashboard { padding:40px; min-height:100vh; opacity:0; transform:translateY(20px); transition:all .6s ease; }
        .dashboard.loaded { opacity:1; transform:translateY(0); }
        .title-box { display:flex; align-items:center; gap:12px; margin-bottom:30px; padding:20px; background:linear-gradient(to right,#fdf4ff,#eef2ff); border-radius:20px; box-shadow:0 6px 20px rgba(0,0,0,.08); }
        .title-icon { font-size:28px; color:#7c3aed; }
        .title { font-size:24px; font-weight:800; background:linear-gradient(to right,#7c3aed,#4338ca); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .table-container { background:#fff; border-radius:20px; box-shadow:0 6px 20px rgba(0,0,0,.08); padding:20px; }
        table { width:100%; border-collapse:collapse; }
        th,td { padding:14px 18px; text-align:left; font-size:14px; }
        th { background:#f9fafb; font-weight:600; color:#374151; text-transform:uppercase; font-size:13px; }
        .row-animate { opacity:0; transform:translateY(20px); }
        .row-animate.show { animation:rowFadeIn .6s forwards; }
        @keyframes rowFadeIn { to { opacity:1; transform:translateY(0); } }
        .schedule-cell { display:flex; flex-direction:column; gap:6px; }
        .schedule-cell .date { background:#eef2ff; color:#4338ca; padding:5px 10px; border-radius:8px; font-weight:600; font-size:13px; }
        .schedule-cell .time { background:#ecfdf5; color:#047857; padding:5px 10px; border-radius:8px; font-weight:600; font-size:13px; }
        .status { padding:6px 10px; border-radius:12px; font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:6px; }
        .status.confirmed { background:#dcfce7; color:#15803d; }
        .status.accepted { background:#f0fdf4; color:#16a34a; }
        .status.assigned { background:#dbeafe; color:#1d4ed8; }
        .status.pending { background:#fef9c3; color:#a16207; }
        .status.canceled { background:#fee2e2; color:#b91c1c; }
        .action-buttons { display:flex; gap:10px; flex-wrap:wrap; }
        .assign-btn,.cancel-btn { border:none; padding:8px 14px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all .25s ease; }
        .assign-btn { background:linear-gradient(to right,#7c3aed,#4f46e5); color:white; }
        .assign-btn:hover { transform:translateY(-2px) scale(1.05); box-shadow:0 6px 16px rgba(124,58,237,.3); }
        .cancel-btn { background:#ef4444; color:white; }
        .cancel-btn:hover { background:#dc2626; }
        .assigned { display:flex; align-items:center; gap:6px; margin-top:6px; font-size:12px; color:#6b7280; }
        .assigned img { width:24px; height:24px; border-radius:50%; }
               .pagination.pretty { 
          display:flex; gap:10px; align-items:center; justify-content:center; 
          margin-top:16px; padding-top:12px; border-top:1px solid #eef2ff; 
        }
        .page-btn { 
          min-width:44px; height:38px; padding:0 12px; 
          border:1.5px solid #8b5cf6; background:#fff; color:#6d28d9; 
          border-radius:10px; font-weight:700; cursor:pointer; 
          transition:transform .15s ease,box-shadow .2s ease,background .2s ease; 
        }
        .page-btn:hover:not(:disabled){ transform:translateY(-1px); }
        .page-btn:disabled{ opacity:.4; cursor:not-allowed; }
        .page-btn.square{ width:44px; padding:0; }
        .page-btn.number.active { 
          background:#7c3aed; color:#fff; border-color:transparent; 
          box-shadow:0 6px 16px rgba(124,58,237,.35); 
        }
        .modal-overlay { 
          position:fixed; inset:0; background:rgba(0,0,0,0.5); 
          display:flex; align-items:center; justify-content:center; 
          z-index:50; backdrop-filter: blur(6px);
        }
        .modal { 
          background:white; padding:30px; border-radius:20px; 
          max-width:480px; width:100%; text-align:center; 
          animation:scaleIn .3s ease; 
          box-shadow:0 20px 40px rgba(0,0,0,.2);
        }
        @keyframes scaleIn { 
          from { opacity:0; transform:scale(0.9); } 
          to { opacity:1; transform:scale(1); } 
        }
        .staff-list { display:flex; flex-direction:column; gap:12px; margin:20px 0; }
        .staff-card { 
          display:flex; align-items:center; gap:12px; padding:12px; 
          border-radius:12px; background:#f9fafb; cursor:pointer; 
          font-weight:600; transition:all .2s ease; 
        }
        .staff-card:hover { 
          background:#ede9fe; color:#5b21b6; 
          transform:translateY(-2px) scale(1.02); 
        }
        .staff-card.disabled { 
          opacity:.5; cursor:not-allowed; pointer-events:none; 
        }
        .staff-card img { width:40px; height:40px; border-radius:50%; }
        .staff-info { display:flex; flex-direction:column; align-items:flex-start; }
        textarea { 
          width:100%; min-height:80px; border:1px solid #e5e7eb; 
          border-radius:12px; padding:10px; font-size:14px; 
          margin-top:10px; margin-bottom:20px; resize:none; outline:none; 
          transition:all 0.2s ease; 
        }
        textarea:focus { 
          border-color:#7c3aed; 
          box-shadow:0 0 0 3px rgba(124,58,237,.25); 
        }
        .close-btn { 
          background:#ef4444; color:white; border:none; 
          padding:10px 18px; border-radius:12px; font-weight:600; 
          cursor:pointer; transition:all 0.2s ease; 
        }
        .close-btn:hover { background:#dc2626; transform:translateY(-2px); }
        .action-icons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 3px 6px rgba(0,0,0,0.12);
}

.icon-btn.assign {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: white;
}
.icon-btn.assign:hover {
  transform: scale(1.12);
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.icon-btn.cancel {
  background: #ef4444;
  color: white;
}
.icon-btn.cancel:hover {
  transform: scale(1.12);
  background: #dc2626;
      }
.status.viewed {
  background: #e0f2fe;
  color: #0369a1;
}


.icon-btn.view {
  background: #0ea5e9;
  color: white;
}
.icon-btn.view:hover {
  background: #38bdf8;
  transform: scale(1.12);
}
.icon-btn.done {
  background: #16a34a;
  color: white;
}
.icon-btn.done:hover {
  background: #22c55e;
  transform: scale(1.12);
}
  


      `}</style>
    </>
  );
}

