import React, { useState, useEffect, useRef } from "react";
import { getProvinces, getDistricts, getWards } from "../services/addressService";

const bannerImages = [
  "https://images.unsplash.com/photo-1728722024453-147a1f6872fa?q=80&w=1332&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1661956593395-36bf09dc5172?q=80&w=1924&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1709145883296-4443310e3be0?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1657322364881-dda370049116?q=80&w=1171&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1610123172705-a57f116cd4d9?q=80&w=1170&auto=format&fit=crop",
];

const titles = [
  { title1: "Không gian sống", title2: "dành cho bạn", subtitle: "Tìm phòng dễ dàng, chọn nơi an cư lý tưởng" },
  { title1: "Khám phá", title2: "không gian cuộc sống", subtitle: "Trải nghiệm tiện nghi, hiện đại và thoải mái" },
  { title1: "Căn hộ lý tưởng", title2: "cho mọi gia đình", subtitle: "An cư lập nghiệp, sống trọn từng khoảnh khắc" },
  { title1: "Tìm kiếm", title2: "nơi ở lý tưởng", subtitle: "Lựa chọn hoàn hảo cho bạn và gia đình" },
  { title1: "Căn hộ tuyệt vời", title2: "cho cuộc sống", subtitle: "Sống tiện nghi, chọn phòng dễ dàng" },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState("sell");

  // Address states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWards, setSelectedWards] = useState([]);

  const [showDropdown, setShowDropdown] = useState(false);

  const [searchProvince, setSearchProvince] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchWard, setSearchWard] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      getDistricts(selectedProvince.code).then(setDistricts).catch(console.error);
    } else {
      setDistricts([]);
      setWards([]);
    }
    setSelectedDistrict(null);
    setSelectedWards([]);
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      getWards(selectedDistrict.code).then(setWards).catch(console.error);
    } else {
      setWards([]);
    }
    setSelectedWards([]);
  }, [selectedDistrict]);

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % bannerImages.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [isHovered]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToPrev = () => setCurrent((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  const goToNext = () => setCurrent((prev) => (prev + 1) % bannerImages.length);

  const toggleWard = (ward) => {
    if (selectedWards.some((w) => w.code === ward.code)) {
      setSelectedWards(selectedWards.filter((w) => w.code !== ward.code));
    } else if (selectedWards.length < 3) {
      setSelectedWards([...selectedWards, ward]);
    }
  };

  const displayAddress = [
    selectedProvince?.name,
    selectedDistrict?.name,
    selectedWards.map((w) => w.name).join(", "),
  ]
    .filter(Boolean)
    .join(" › ");

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(searchProvince.toLowerCase())
  );
  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(searchDistrict.toLowerCase())
  );
  const filteredWards = wards.filter((w) =>
    w.name.toLowerCase().includes(searchWard.toLowerCase())
  );

  const handleSearch = () => {
    console.log("Tìm kiếm với:", {
      tab: activeTab,
      province: selectedProvince,
      district: selectedDistrict,
      wards: selectedWards,
    });
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWards([]);
  };

  return (
    <div
      style={styles.carousel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {bannerImages.map((img, index) => (
        <div
          key={index}
          style={{
            ...styles.slide,
            backgroundImage: `url(${img})`,
            opacity: index === current ? 1 : 0,
          }}
        />
      ))}

      {/* Overlay */}
      <div style={styles.centerBox}>
        <div style={styles.textBox}>
          <h1 style={styles.title}>
            <span style={styles.highlight}>{titles[current].title1} </span>
            <span>{titles[current].title2}</span>
          </h1>
          <p style={styles.subtitle}>{titles[current].subtitle}</p>
        </div>

        {/* Search Box */}
        <div style={styles.searchBox} ref={dropdownRef}>
          <div style={styles.tabs}>
            {["sell", "rent", "project"].map((tab) => (
              <button
                key={tab}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab ? styles.activeTab : {}),
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "sell" ? "Nhà đất bán" : tab === "rent" ? "Nhà đất cho thuê" : "Dự án"}
              </button>
            ))}
          </div>

          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Chọn tỉnh/thành, quận/huyện, phường/xã..."
              style={styles.input}
              readOnly
              value={displayAddress}
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {displayAddress && (
              <button style={styles.clearButton} onClick={handleClear}>
                ✕
              </button>
            )}
            <button style={styles.searchButton} onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>

          {showDropdown && (
            <div style={styles.dropdownWrapper}>
              <div style={styles.dropdownCol}>
                <h4 style={styles.colTitle}>Tỉnh/Thành phố</h4>
                <input
                  type="text"
                  placeholder="Tìm tỉnh/thành..."
                  style={styles.dropdownSearch}
                  value={searchProvince}
                  onChange={(e) => setSearchProvince(e.target.value)}
                />
                <div style={styles.provinceGrid}>
                  {filteredProvinces.map((p) => (
                    <div
                      key={p.code}
                      style={{
                        ...styles.provinceCard,
                        ...(selectedProvince?.code === p.code ? styles.activeProvince : {}),
                      }}
                      onClick={() => setSelectedProvince(p)}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>

              {selectedProvince && (
                <div style={styles.dropdownCol}>
                  <h4 style={styles.colTitle}>Quận/Huyện</h4>
                  <input
                    type="text"
                    placeholder="Tìm quận/huyện..."
                    style={styles.dropdownSearch}
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                  />
                  <div style={styles.listBox}>
                    {filteredDistricts.map((d) => (
                      <div
                        key={d.code}
                        style={{
                          ...styles.dropdownItem,
                          ...(selectedDistrict?.code === d.code ? styles.activeItem : {}),
                        }}
                        onClick={() => setSelectedDistrict(d)}
                      >
                        {d.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDistrict && (
                <div style={styles.dropdownCol}>
                  <h4 style={styles.colTitle}>Phường/Xã (tối đa 3)</h4>
                  <input
                    type="text"
                    placeholder="Tìm phường/xã..."
                    style={styles.dropdownSearch}
                    value={searchWard}
                    onChange={(e) => setSearchWard(e.target.value)}
                  />
                  <div style={styles.listBox}>
                    {filteredWards.map((w) => (
                      <div
                        key={w.code}
                        style={{
                          ...styles.dropdownItem,
                          ...(selectedWards.some((sw) => sw.code === w.code)
                            ? styles.activeItem
                            : {}),
                        }}
                        onClick={() => toggleWard(w)}
                      >
                        {w.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={styles.filters}>
            <select style={styles.select}>
              <option>Loại nhà đất</option>
              <option>Chung cư</option>
              <option>Nhà riêng</option>
            </select>
            <select style={styles.select}>
              <option>Khoảng giá</option>
              <option>Dưới 1 tỷ</option>
              <option>1 - 3 tỷ</option>
            </select>
            <select style={styles.select}>
              <option>Diện tích</option>
              <option>Dưới 30m²</option>
              <option>30 - 60m²</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.dots}>
        {bannerImages.map((_, i) => (
          <span
            key={i}
            style={{
              ...styles.dot,
              background: i === current ? "#8a5cff" : "#ddd",
            }}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

      <div style={styles.navButtons}>
        <button style={styles.navButton} onClick={goToPrev}>
          ❮
        </button>
        <button style={styles.navButton} onClick={goToNext}>
          ❯
        </button>
      </div>
    </div>
  );
}

const styles = {
  carousel: { position: "relative", width: "100%", height: "650px", overflow: "hidden", borderRadius: "18px", marginBottom: "35px" },
  slide: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundSize: "cover", backgroundPosition: "center", transition: "opacity 1s ease-in-out" },
  centerBox: { position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", width: "85%", maxWidth: "950px", textAlign: "center", color: "#fff", zIndex: 5 },
  textBox: { marginBottom: "18px", animation: "fadeInDown 0.8s ease" },
  title: { fontSize: "34px", fontWeight: "800", color: "#111827", backgroundColor: "rgba(255,255,255,0.9)", padding: "10px 24px", borderRadius: "8px", display: "inline-block", marginBottom: "10px" },
  highlight: { background: "linear-gradient(90deg, #7b2ff7, #8a5cff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subtitle: { fontSize: "16px", color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.6)", marginBottom: "16px" },
  searchBox: { background: "rgba(255, 255, 255, 0.97)", borderRadius: "12px", padding: "16px", width: "95%", margin: "0 auto", boxShadow: "0 6px 20px rgba(0,0,0,0.2)", animation: "fadeInUp 0.8s ease" },
  tabs: { display: "flex", gap: "6px", marginBottom: "10px" },
  tab: { flex: 1, padding: "9px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#333", fontSize: "13px", transition: "0.3s" },
  activeTab: { background: "linear-gradient(90deg, #7b2ff7, #8a5cff)", color: "white", border: "none" },
  searchRow: { display: "flex", alignItems: "center", marginBottom: "10px", position: "relative" },
  input: { flex: 1, padding: "9px", border: "1px solid #ddd", borderRadius: "6px 0 0 6px", outline: "none", fontSize: "13px", cursor: "pointer" },
  clearButton: { position: "absolute", right: "85px", background: "transparent", border: "none", fontSize: "15px", cursor: "pointer", color: "#888" },
  searchButton: { background: "linear-gradient(90deg, #7b2ff7, #8a5cff)", color: "white", border: "none", padding: "9px 16px", borderRadius: "0 6px 6px 0", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  filters: { display: "flex", gap: "8px", marginTop: "10px" },
  select: { flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", background: "#fff" },

  dropdownWrapper: { display: "flex", gap: "12px", marginTop: "10px", background: "#fff", borderRadius: "8px", padding: "12px", boxShadow: "0 6px 25px rgba(0,0,0,0.2)", animation: "fadeIn 0.4s ease" },
  dropdownCol: { flex: 1, minWidth: "230px" },
  colTitle: { fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#333" },
  dropdownSearch: { width: "100%", padding: "8px", marginBottom: "8px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", outline: "none" },

  provinceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px", maxHeight: "200px", overflowY: "auto" },
  provinceCard: { padding: "8px", background: "#f9f9f9", borderRadius: "6px", cursor: "pointer", textAlign: "center", transition: "0.25s", color: "#333", fontSize: "12px" },
  activeProvince: { background: "#8a5cff", color: "#fff", fontWeight: "600" },

  listBox: { maxHeight: "200px", overflowY: "auto", border: "1px solid #eee", borderRadius: "6px" },
  dropdownItem: { padding: "8px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", transition: "0.2s", color: "#333", fontSize: "12px" },
  activeItem: { background: "#f0eaff", color: "#7b2ff7", fontWeight: "600" },

  dots: { position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%", cursor: "pointer", transition: "0.3s" },
  navButtons: { position: "absolute", top: "50%", left: "10px", right: "10px", display: "flex", justifyContent: "space-between", transform: "translateY(-50%)", zIndex: 4 },
  navButton: { background: "transparent", color: "#fff", border: "none", cursor: "pointer", fontSize: "28px", padding: "4px", transition: "0.3s" },
};

// Animation CSS inject
const style = document.createElement("style");
style.innerHTML = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);
