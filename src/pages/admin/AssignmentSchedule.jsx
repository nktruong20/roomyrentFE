import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiLoader,
  FiThumbsUp,
  FiEye, // 👈 icon cho Đã xem
} from "react-icons/fi";
import Swal from "sweetalert2";
import { getMySchedules, updateSchedule } from "../../services/scheduleService";
import { getMe } from "../../services/authService";

export default function AssignmentSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // ✅ Lấy user hiện tại
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        Swal.fire("Lỗi", "Không thể tải thông tin người dùng", "error");
      }
    };
    fetchUser();
  }, []);

  // ✅ Lấy danh sách lịch hẹn
  useEffect(() => {
    if (!user) return;
    const fetchSchedules = async () => {
      try {
        const data = await getMySchedules();
        setSchedules(data);
      } catch {
        Swal.fire("Lỗi", "Không thể tải danh sách lịch hẹn", "error");
      } finally {
        setTimeout(() => setLoaded(true), 200);
      }
    };
    fetchSchedules();
    const interval = setInterval(fetchSchedules, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => setCurrentPage(1), [schedules]);

  // ✅ Update trạng thái
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
      setSchedules((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
      Swal.fire("Thành công", `Lịch hẹn đã ${text.toLowerCase()}`, "success");
    } catch {
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái", "error");
    }
  }

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
          <FiThumbsUp /> Đã chấp nhận
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

  // --- Sort & paginate ---
  const sorted = schedules.slice().sort((a, b) => {
    const order = {
      pending: 1,
      assigned: 2,
      accepted: 3,
      viewed: 4,
      done: 5,
      canceled: 6,
    };
    return (order[a.status] || 99) - (order[b.status] || 99);
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(pageStart, pageStart + pageSize);

  const goToPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));
  const prev = () => goToPage(currentPage - 1);
  const next = () => goToPage(currentPage + 1);

  return (
    <>
      <div className={`dashboard ${loaded ? "loaded" : ""}`}>
        <div className="title-box">
          <FiCalendar className="title-icon" />
          <h1 className="title">📅 Lịch hẹn của tôi</h1>
        </div>

        <div className="table-container">
          {schedules.length === 0 ? (
            <p className="empty">Không có lịch hẹn nào được phân công cho bạn.</p>
          ) : (
            <>
              <table className="animated-table">
                <thead>
                  <tr>
                    <th>ID</th>
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
                      <td className="stt">{pageStart + index + 1}</td>
                      <td>{s.customer_name}</td>
                      <td>{s.customer_phone}</td>
                      <td>
                        {s.room_id ? (
                          <a
                            href={`/admin/room/${s.room_id._id}`}
                            className="room-link"
                          >
                            {s.room_id?.apartmentName ||
                              s.room_id?.title ||
                              "Xem phòng"}
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
                            {new Date(s.end_time).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td>{s.note || "—"}</td>
                      <td>{renderStatus(s.status)}</td>
                      <td>
                        {s.status === "assigned" && (
                          <div className="action-btns">
                            <button
                              className="icon-btn accept"
                              onClick={() =>
                                handleUpdateStatus(
                                  s._id,
                                  "accepted",
                                  "Chấp nhận"
                                )
                              }
                              title="Chấp nhận"
                            >
                              <FiThumbsUp />
                            </button>
                            <button
                              className="icon-btn cancel"
                              onClick={() =>
                                handleUpdateStatus(s._id, "canceled", "Hủy")
                              }
                              title="Hủy"
                            >
                              <FiXCircle />
                            </button>
                          </div>
                        )}

                        {s.status === "accepted" && (
                          <div className="action-btns">
                            <button
                              className="icon-btn view"
                              onClick={() =>
                                handleUpdateStatus(s._id, "viewed", "Đã xem")
                              }
                              title="Đã xem"
                            >
                              <FiEye />
                            </button>
                            <button
                              className="icon-btn cancel"
                              onClick={() =>
                                handleUpdateStatus(s._id, "canceled", "Hủy")
                              }
                              title="Hủy"
                            >
                              <FiXCircle />
                            </button>
                          </div>
                        )}

                        {s.status === "viewed" && (
                          <div className="action-btns">
                            <button
                              className="icon-btn done"
                              onClick={() =>
                                handleUpdateStatus(s._id, "done", "Hoàn thành")
                              }
                              title="Hoàn thành"
                            >
                              <FiCheckCircle />
                            </button>
                            <button
                              className="icon-btn cancel"
                              onClick={() =>
                                handleUpdateStatus(s._id, "canceled", "Hủy")
                              }
                              title="Hủy"
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
              <div className="pagination">
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
            </>
          )}
        </div>
      </div>

      <style>{`
        .dashboard { padding:40px; min-height:100vh; background:#f9fafb; opacity:0; transform:translateY(20px); transition:all .6s ease; }
        .dashboard.loaded { opacity:1; transform:translateY(0); }
        .title-box { display:flex; align-items:center; gap:12px; margin-bottom:30px; padding:20px; background:linear-gradient(90deg,#6366f1,#8b5cf6); border-radius:20px; box-shadow:0 8px 24px rgba(0,0,0,.15); color:white; }
        .title-icon { font-size:28px; }
        .title { font-size:24px; font-weight:800; }
        .table-container { background:#fff; border-radius:20px; box-shadow:0 6px 20px rgba(0,0,0,.08); padding:20px; overflow-x:auto; }
        .empty { padding:20px; color:#6b7280; text-align:center; }
        table { width:100%; border-collapse:collapse; }
        th { padding:14px 18px; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; background:linear-gradient(90deg,#f3f4f6,#e0e7ff); color:#374151; font-weight:700; text-align:left; }
        td { padding:14px 18px; font-size:14px; }
        tr:hover { background:#f9fafc; transform:scale(1.002); transition:all .25s ease; }
        .stt { font-weight:700; color:#4f46e5; text-align:center; }
        .row-animate { opacity:0; transform:translateY(20px); }
        .row-animate.show { animation:rowFadeIn .6s forwards; }
        @keyframes rowFadeIn { to{opacity:1; transform:translateY(0);} }
        .room-link { color:#4f46e5; font-weight:600; text-decoration:none; }
        .schedule-cell { display:flex; flex-direction:column; gap:6px; }
        .schedule-cell .date { background:#eef2ff; color:#4338ca; padding:5px 10px; border-radius:8px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; gap:6px; }
        .schedule-cell .time { background:#ecfdf5; color:#047857; padding:5px 10px; border-radius:8px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; gap:6px; }
        .status { padding:6px 10px; border-radius:12px; font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:6px; }
        .status.confirmed { background:#dcfce7; color:#15803d; }
        .status.accepted { background:#f0fdf4; color:#16a34a; }
        .status.viewed { background:#e0f2fe; color:#0369a1; }
        .status.assigned { background:#dbeafe; color:#1d4ed8; }
        .status.pending { background:#fef9c3; color:#a16207; }
        .status.canceled { background:#fee2e2; color:#b91c1c; }
        .action-btns { display:flex; gap:10px; }
        .icon-btn { width:40px; height:40px; border-radius:50%; border:none; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition:all .25s ease; box-shadow:0 3px 6px rgba(0,0,0,0.12); }
        .icon-btn.accept { background:#2563eb; color:white; }
        .icon-btn.accept:hover { transform:scale(1.12); background:#3b82f6; }
        .icon-btn.view { background:#0ea5e9; color:white; }
        .icon-btn.view:hover { background:#38bdf8; transform:scale(1.12); }
        .icon-btn.done { background:#16a34a; color:white; }
        .icon-btn.done:hover { transform:scale(1.12); background:#22c55e; }
        .icon-btn.cancel { background:#dc2626; color:white; }
        .icon-btn.cancel:hover { transform:scale(1.12); background:#ef4444; }
        .pagination { display:flex; gap:10px; align-items:center; justify-content:center; margin-top:16px; padding-top:12px; border-top:1px solid #eef2ff; }
        .page-btn { min-width:44px; height:38px; padding:0 12px; border:1.5px solid #8b5cf6; background:#fff; color:#6d28d9; border-radius:10px; font-weight:700; cursor:pointer; transition:transform .15s ease,box-shadow .2s ease,background .2s ease; }
        .page-btn.number.active { background:#7c3aed; color:#fff; border-color:transparent; box-shadow:0 6px 16px rgba(124,58,237,.35); }
        .page-btn:hover:not(:disabled){ transform:translateY(-1px); }
        .page-btn:disabled{ opacity:.4; cursor:not-allowed; }
        .page-btn.square{ width:44px; padding:0; }
      `}</style>
    </>
  );
}
