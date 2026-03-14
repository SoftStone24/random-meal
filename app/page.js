"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const RADII = [{ label: "1km", value: 1000 }, { label: "2km", value: 2000 }, { label: "3km", value: 3000 }, { label: "5km", value: 5000 }];

// ── Food categories ──
const FOOD_GROUPS = {
  "Món nước": ["Phở bò", "Phở gà", "Bún bò Huế", "Bún riêu cua", "Bún thang", "Cháo lòng", "Cháo gà", "Cháo trắng heo quẩy", "Bánh canh", "Hủ tiếu", "Mì quảng", "Bún chả Hà Nội", "Bún thịt nướng", "Bún bò xào", "Bún nem nướng", "Bún cá Nha Trang", "Bún mắm", "Bún kèn", "Bún suông", "Bún đậu mắm tôm", "Lẩu thái hải sản", "Lẩu bò nhúng dấm", "Lẩu gà lá é", "Lẩu nấm", "Lẩu mắm", "Lẩu riêu cua", "Lẩu Thái chua cay", "Lẩu Trung Hoa", "Cháo hải sản"],
  "Món cơm": ["Cơm tấm sườn bì chả", "Cơm tấm đặc biệt", "Cơm rang dương châu", "Cơm gà xối mỡ", "Cơm sườn", "Cơm chiên cá mặn", "Cơm chiên trứng", "Cơm gà Hội An", "Cơm hến", "Cơm niêu Singapore", "Cơm chiên hải sản", "Cơm Nhật", "Cơm Hàn", "Cơm Thái"],
  "Món khô": ["Xôi xéo", "Xôi gà", "Xôi lạc", "Xôi ngô", "Xôi chiên phồng", "Bánh mì thịt", "Bánh mì trứng", "Bánh mì pate", "Bánh mì chả cá", "Bánh mì bì", "Bánh mì kẹp thịt nướng", "Bánh cuốn", "Bánh ướt", "Bánh đúc", "Bánh bao", "Bánh tiêu", "Bánh rán", "Bánh xèo", "Bánh khọt", "Bột chiên", "Gỏi cuốn", "Nem cuốn", "Chả giò", "Dimsum", "Gỏi ngó sen", "Gỏi bưởi tôm thịt"],
  "Món nướng/BBQ": ["Bò nướng lá lốt", "Sườn nướng", "Gà nướng muối ớt", "Mực nướng", "Tôm nướng muối", "Ốc hấp sả", "Ốc len xào dừa", "Hàu nướng mỡ hành", "Cá lóc nướng trui", "Vịt quay", "Gà hấp hành", "Chả cá Lã Vọng", "BBQ Hàn Quốc", "Steak"],
  "Món nước ngoài": ["Pizza", "Burger", "Mì Ý", "Salad gà", "Sandwich", "Wrap", "Mì ramen", "Phở xào", "Mì xào giòn", "Mì xào mềm", "Hủ tiếu xào"],
  "Đồ uống": ["Chè"],
};

// Build FOODS by meal with group info attached
const ALL_FOODS_WITH_GROUP = Object.entries(FOOD_GROUPS).flatMap(([group, items]) =>
  items.map(name => ({ name, group }))
);

const FOODS = {
  sang: [
    "Phở bò", "Phở gà", "Bún bò Huế", "Bún riêu cua", "Bún thang",
    "Cháo lòng", "Cháo gà", "Cháo trắng heo quẩy", "Xôi xéo", "Xôi gà",
    "Xôi lạc", "Xôi ngô", "Bánh mì thịt", "Bánh mì trứng", "Bánh mì pate",
    "Bánh cuốn", "Bánh ướt", "Bánh canh", "Hủ tiếu", "Mì quảng",
    "Bánh đúc", "Cơm tấm sườn bì chả", "Bún đậu mắm tôm", "Bột chiên",
    "Bánh bao", "Xôi chiên phồng", "Bánh tiêu", "Bánh rán", "Chè",
  ],
  trua: [
    "Cơm tấm đặc biệt", "Cơm rang dương châu", "Cơm gà xối mỡ", "Cơm sườn",
    "Bún chả Hà Nội", "Bún thịt nướng", "Bún bò xào", "Bún nem nướng",
    "Phở xào", "Mì xào giòn", "Mì xào mềm", "Hủ tiếu xào",
    "Bánh mì chả cá", "Bánh mì bì", "Bánh mì kẹp thịt nướng",
    "Cơm chiên cá mặn", "Cơm chiên trứng", "Cơm gà Hội An",
    "Bún cá Nha Trang", "Bún mắm", "Bún kèn", "Bún suông",
    "Cơm hến", "Bánh xèo", "Bánh khọt",
    "Pizza", "Burger", "Mì Ý", "Cơm Nhật", "Cơm Hàn",
    "Salad gà", "Sandwich", "Wrap", "Cơm Thái", "Mì ramen",
    "Gỏi cuốn", "Nem cuốn", "Chả giò",
  ],
  toi: [
    "Lẩu thái hải sản", "Lẩu bò nhúng dấm", "Lẩu gà lá é", "Lẩu nấm",
    "Lẩu mắm", "Lẩu riêu cua", "Lẩu Thái chua cay",
    "Bò nướng lá lốt", "Sườn nướng", "Gà nướng muối ớt", "Mực nướng",
    "Tôm nướng muối", "Ốc hấp sả", "Ốc len xào dừa", "Hàu nướng mỡ hành",
    "Bún đậu mắm tôm", "Bún bò Huế", "Cháo hải sản",
    "Cơm niêu Singapore", "Cơm chiên hải sản",
    "Steak", "BBQ Hàn Quốc", "Lẩu Trung Hoa", "Dimsum",
    "Cá lóc nướng trui", "Vịt quay", "Gà hấp hành",
    "Gỏi ngó sen", "Gỏi bưởi tôm thịt", "Chả cá Lã Vọng",
  ],
};

const MEAL_LABELS = { sang: "🌅 Sáng", trua: "☀️ Trưa", toi: "🌙 Tối" };

// Helper — get group of a food item
function getFoodGroup(name) {
  for (const [group, items] of Object.entries(FOOD_GROUPS)) {
    if (items.includes(name)) return group;
  }
  return "Khác";
}

// ── Fetch nearby restaurants via our API route ──
async function fetchNearbyRestaurants(lat, lng, radius) {
  const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&radius=${radius}`);
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") throw new Error(data.status);
  return (data.results || []).map(p => ({
    id: p.place_id,
    name: p.name,
    type: p.types?.slice(0, 2).map(t => t.replace(/_/g, " ")).join(" · ") || "Nhà hàng",
    rating: p.rating || 4.0,
    reviews: p.user_ratings_total || 0,
    address: p.vicinity || "",
    photo: p.photos?.[0]
      ? `/api/places?type=photo&url=${encodeURIComponent(p.photos[0].photo_reference)}`
      : null,
    lat: p.geometry.location.lat,
    lng: p.geometry.location.lng,
    dishes: [],
    priceLevel: p.price_level,
    openNow: p.opening_hours?.open_now,
  }));
}

// ── Get distance between two coords (meters) ──
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatDistance(m) {
  return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
}

// ── Suggest dishes using Claude API ──
async function suggestDishes(restaurantName, restaurantType) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Quán ăn tên "${restaurantName}", loại: "${restaurantType}". Gợi ý đúng 3 món ăn tiêu biểu ngắn gọn. Trả lời JSON array, ví dụ: ["Phở bò tái", "Phở gà", "Bún bò"]. Chỉ JSON, không giải thích.`
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return ["Món đặc biệt", "Món theo ngày", "Hỏi nhân viên"];
  }
}

function StarRating({ rating }) {
  return (
    <span>
      <span style={{ color: "#ffd54f", fontSize: 12 }}>{"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}</span>
      <span style={{ color: "#666", fontSize: 11, marginLeft: 5 }}>{rating} ({(Math.random() * 900 + 100).toFixed(0)} đánh giá)</span>
    </span>
  );
}

function PriceLevel({ level }) {
  if (!level) return null;
  const labels = ["", "Bình dân", "Trung bình", "Cao cấp", "Sang trọng"];
  const colors = ["", "#4caf50", "#f97316", "#e94560", "#a78bfa"];
  return <span style={{ fontSize: 10, color: colors[level], background: colors[level] + "18", padding: "2px 8px", border: `1px solid ${colors[level]}33` }}>{labels[level]}</span>;
}

function SlotMachine({ spinning, result, allRestaurants }) {
  const [displayName, setDisplayName] = useState("???");
  const intervalRef = useRef(null);
  useEffect(() => {
    if (spinning && allRestaurants.length > 0) {
      let i = 0;
      intervalRef.current = setInterval(() => {
        setDisplayName(allRestaurants[i % allRestaurants.length].name);
        i++;
      }, 80);
    } else {
      clearInterval(intervalRef.current);
      setDisplayName(result ? result.name : "???");
    }
    return () => clearInterval(intervalRef.current);
  }, [spinning, result, allRestaurants]);

  return (
    <div style={{
      fontFamily: "'Be Vietnam Pro', sans-serif",
      fontSize: spinning ? 22 : 30, fontWeight: 800,
      color: spinning ? "#444" : "#fff",
      letterSpacing: "-0.5px", transition: "all 0.3s",
      minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "0 20px", lineHeight: 1.2
    }}>{displayName}</div>
  );
}

function ResultCard({ restaurant, userLat, userLng, onReroll, onBlacklist }) {
  const [visible, setVisible] = useState(false);
  const [dishes, setDishes] = useState(restaurant.dishes);
  const [loadingDishes, setLoadingDishes] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    if (!restaurant.dishes?.length) {
      setLoadingDishes(true);
      suggestDishes(restaurant.name, restaurant.type).then(d => {
        setDishes(d);
        setLoadingDishes(false);
      });
    }
  }, [restaurant]);

  const distance = userLat && restaurant.lat
    ? formatDistance(getDistance(userLat, userLng, restaurant.lat, restaurant.lng))
    : restaurant.distance || "";

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(restaurant.name + " " + restaurant.address)}`;

  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "all 0.4s ease", width: "100%", maxWidth: 480
    }}>
      {/* Photo */}
      <div style={{ position: "relative", overflow: "hidden", height: 220, background: "#111" }}>
        {restaurant.photo
          ? <img src={restaurant.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
          : <div style={{ width: "100%", height: "100%", background: "#111115", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🍜</div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 35%, rgba(0,0,0,0.92))" }} />

        {/* Open now badge */}
        {restaurant.openNow !== undefined && (
          <div style={{ position: "absolute", top: 12, left: 12, background: restaurant.openNow ? "#1a3a1a" : "#3a1a1a", border: `1px solid ${restaurant.openNow ? "#4caf50" : "#e94560"}44`, padding: "3px 10px", fontSize: 9, color: restaurant.openNow ? "#4caf50" : "#e94560", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {restaurant.openNow ? "● Đang mở" : "● Đã đóng"}
          </div>
        )}

        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.7)", padding: "4px 10px", backdropFilter: "blur(4px)" }}>
          <StarRating rating={restaurant.rating} />
        </div>

        <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}>
          <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>{restaurant.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{restaurant.type}</span>
            <PriceLevel level={restaurant.priceLevel} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ background: "#111115", border: "1px solid #1e1e24", borderTop: "none", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#555", flex: 1, marginRight: 12, lineHeight: 1.5 }}>📍 {restaurant.address}</div>
          <div style={{ fontSize: 13, color: "#f97316", fontWeight: 700, flexShrink: 0 }}>{distance}</div>
        </div>

        {/* Dishes */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
            🍽 Gợi ý món hôm nay
          </div>
          {loadingDishes ? (
            <div style={{ fontSize: 11, color: "#333", fontStyle: "italic" }}>Đang gợi ý món...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {(dishes?.length ? dishes : ["Món đặc biệt", "Hỏi nhân viên", "Theo ngày"]).map((dish, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: i === 0 ? "#e94560" : "#1a1a1e",
                    border: i === 0 ? "none" : "1px solid #2a2a2e",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: i === 0 ? "#fff" : "#444", fontWeight: 700, flexShrink: 0
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: i === 0 ? "#fff" : "#888", fontFamily: "'Be Vietnam Pro', sans-serif" }}>{dish}</span>
                  {i === 0 && <span style={{ fontSize: 8, color: "#e94560", letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid #e9456033", padding: "1px 6px" }}>gợi ý</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Primary actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{
              flex: 2, background: "#e94560", color: "#fff", padding: "11px",
              fontSize: 12, fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.05em", textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>🗺 Đi thôi!</a>
            <button onClick={onReroll} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a2e", color: "#888", padding: "11px", fontSize: 11, fontFamily: "'Be Vietnam Pro', sans-serif", cursor: "pointer" }}>↺ Khác</button>
            <button onClick={() => onBlacklist(restaurant)} style={{ flex: 1, background: "transparent", border: "1px solid #2a2a2e", color: "#555", padding: "11px", fontSize: 11, fontFamily: "'Be Vietnam Pro', sans-serif", cursor: "pointer" }}>✕ Bỏ</button>
          </div>

          {/* Delivery actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href={`grabfood://search?keyword=${encodeURIComponent(restaurant.name)}`}
              target="_blank" rel="noreferrer"
              style={{
                flex: 1, background: "#0d1a0d", border: "1px solid #00b14f44",
                color: "#00b14f", padding: "9px",
                fontSize: 11, fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600,
                textDecoration: "none", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 6, cursor: "pointer"
              }}>
              <span style={{ fontSize: 14 }}>🟢</span> GrabFood
            </a>
            <a
              href={`shopeefood://search?keyword=${encodeURIComponent(restaurant.name)}`}
              target="_blank" rel="noreferrer"
              style={{
                flex: 1, background: "#1a0d0a", border: "1px solid #ee4d2d44",
                color: "#ee4d2d", padding: "9px",
                fontSize: 11, fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600,
                textDecoration: "none", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 6, cursor: "pointer"
              }}>
              <span style={{ fontSize: 14 }}>🟠</span> ShopeeFood
            </a>
          </div>

          {/* Delivery note */}
          <div style={{ fontSize: 9, color: "#2a2a2e", textAlign: "center", letterSpacing: "0.05em" }}>
            Nhấn để tìm quán trên app giao hàng — kết quả tuỳ theo app
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LunchSpin() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [areaLabel, setAreaLabel] = useState("");
  const [radius, setRadius] = useState(2000);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("quan");

  // Food tab state
  const [selectedMeal, setSelectedMeal] = useState("trua");
  const [foodSpinning, setFoodSpinning] = useState(false);
  const [foodResult, setFoodResult] = useState(null);
  const [foodDisplay, setFoodDisplay] = useState("???");
  const [showFoodFilter, setShowFoodFilter] = useState(false);
  const [blockedFoodGroups, setBlockedFoodGroups] = useState([]);
  const [blockedFoods, setBlockedFoods] = useState([]);
  const foodIntervalRef = useRef(null);

  // Available foods after filter
  const availableFoods = FOODS[selectedMeal].filter(f => {
    if (blockedFoods.includes(f)) return false;
    if (blockedFoodGroups.includes(getFoodGroup(f))) return false;
    return true;
  });
  const [blacklist, setBlacklist] = useState([]);
  const [history, setHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [blockedTypes, setBlockedTypes] = useState([]);
  const [manualRestaurants, setManualRestaurants] = useState([]);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualType, setManualType] = useState("Quán ăn");
  const [customAddress, setCustomAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  // Combine API + manual restaurants
  const allRestaurants = [...restaurants, ...manualRestaurants];

  // Extract unique cuisine types — split by · and deduplicate
  const allTypes = [...new Set(
    allRestaurants.flatMap(r =>
      r.type.split(" · ").map(t => t.trim().toLowerCase()).filter(t => t.length > 1 && t.length < 30)
    )
  )].sort();

  const available = allRestaurants.filter(r => {
    if (blacklist.includes(r.id)) return false;
    const rTypes = r.type.split(" · ").map(t => t.trim());
    if (rTypes.some(t => blockedTypes.includes(t))) return false;
    return true;
  });

  const handleAddManual = () => {
    if (!manualName.trim()) return;
    const newR = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      address: manualAddress.trim() || "Địa chỉ chưa nhập",
      type: manualType,
      rating: null,
      photo: null,
      lat: null, lng: null,
      dishes: [], priceLevel: null, openNow: true,
      isManual: true,
    };
    setManualRestaurants(prev => [...prev, newR]);
    setManualName(""); setManualAddress(""); setManualType("Quán ăn");
    setShowAddManual(false);
  };

  // ── Load restaurants from Google Places ──
  const loadRestaurants = useCallback(async (lat, lng, r) => {
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await fetchNearbyRestaurants(lat, lng, r);
      setRestaurants(data);
    } catch (e) {
      setError("Không thể tải dữ liệu quán ăn. Kiểm tra API key.");
    }
    setLoading(false);
  }, []);

  // ── Get current location ──
  const getLocation = () => {
    if (!navigator.geolocation) { setError("Trình duyệt không hỗ trợ GPS."); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLat(lat); setUserLng(lng);
        setAreaLabel("Vị trí hiện tại");
        loadRestaurants(lat, lng, radius);
      },
      () => { setError("Không lấy được vị trí. Hãy nhập địa chỉ."); setLoading(false); }
    );
  };

  // ── Geocode custom address ──
  const geocodeAddress = async () => {
    if (!customAddress.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch(`/api/places?type=geocode&address=${encodeURIComponent(customAddress)}`);
      const data = await res.json();
      if (data.results?.length) {
        const { lat, lng } = data.results[0].geometry.location;
        setUserLat(lat); setUserLng(lng);
        setAreaLabel(customAddress);
        setCustomAddress("");
        setShowSettings(false);
        loadRestaurants(lat, lng, radius);
      } else {
        setError("Không tìm thấy địa chỉ này.");
      }
    } catch { setError("Lỗi tìm kiếm địa chỉ."); }
    setGeocoding(false);
  };

  // ── Auto get location on first load ──
  useEffect(() => { getLocation(); }, []);

  const handleSpin = () => {
    if (spinning || available.length === 0) return;
    setResult(null);
    setSpinning(true);
    setTimeout(() => {
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, Math.min(3, shuffled.length));
      setSpinning(false);
      setResult(picks);
      picks.forEach(pick => setHistory(prev => [{ ...pick, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }, ...prev.slice(0, 9)]));
    }, 2200);
  };

  const handleBlacklist = (r) => {
    setBlacklist(prev => [...prev, r.id]);
    setResult(prev => prev ? prev.filter(x => x.id !== r.id) : null);
  };

  // ── Food spin ──
  const handleFoodSpin = () => {
    if (foodSpinning || availableFoods.length === 0) return;
    setFoodResult(null);
    setFoodSpinning(true);
    let i = 0;
    foodIntervalRef.current = setInterval(() => {
      setFoodDisplay(availableFoods[i % availableFoods.length]);
      i++;
    }, 80);
    setTimeout(() => {
      clearInterval(foodIntervalRef.current);
      const shuffled = [...availableFoods].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, 3);
      setFoodDisplay(picks[0]);
      setFoodResult(picks);
      setFoodSpinning(false);
    }, 2200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08080a", fontFamily: "'Be Vietnam Pro', sans-serif", color: "#e8e8e8", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Syne:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Be Vietnam Pro', sans-serif; }
        button, input, a { font-family: 'Be Vietnam Pro', sans-serif !important; }
        ::-webkit-scrollbar { width: 3px; background: #08080a; }
        ::-webkit-scrollbar-thumb { background: #222; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        .btn:hover { opacity: 0.8; }
      `}</style>

      {/* HEADER */}
      <header style={{ padding: "18px 28px", borderBottom: "1px solid #111" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>
              LUNCH<span style={{ color: "#e94560" }}>.</span>SPIN
            </div>
            <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.15em", marginTop: 1 }}>hôm nay ăn gì?</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {activeTab === "quan" && [
              { label: `Danh Sách Bỏ Qua${(blockedTypes.length + blacklist.length) > 0 ? ` (${blockedTypes.length + blacklist.length})` : ""}`, action: () => { setShowFilter(true); setShowHistory(false); setShowSettings(false); } },
              { label: `Lịch sử${history.length ? ` (${history.length})` : ""}`, action: () => { setShowHistory(true); setShowSettings(false); setShowFilter(false); } },
              { label: "⚙", action: () => { setShowSettings(true); setShowHistory(false); setShowFilter(false); } },
            ].map(b => (
              <button key={b.label} className="btn" onClick={b.action} style={{ background: "none", border: "1px solid #1e1e24", color: "#555", padding: "6px 12px", fontSize: 10, cursor: "pointer" }}>{b.label}</button>
            ))}
            {activeTab === "mon" && (
              <button className="btn" onClick={() => setShowFoodFilter(true)} style={{
                background: (blockedFoodGroups.length + blockedFoods.length) > 0 ? "#1a0a0e" : "none",
                border: (blockedFoodGroups.length + blockedFoods.length) > 0 ? "1px solid #e9456044" : "1px solid #1e1e24",
                color: (blockedFoodGroups.length + blockedFoods.length) > 0 ? "#e94560" : "#555",
                padding: "6px 12px", fontSize: 10, cursor: "pointer"
              }}>
                🚫 Bỏ Qua{(blockedFoodGroups.length + blockedFoods.length) > 0 ? ` (${blockedFoodGroups.length + blockedFoods.length})` : ""}
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1a1a1e" }}>
          {[
            { key: "quan", label: "🏪 Random Quán Ăn" },
            { key: "mon", label: "🍜 Random Món Ăn" },
          ].map(tab => (
            <button key={tab.key} className="btn" onClick={() => setActiveTab(tab.key)} style={{
              background: "none", border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #e94560" : "2px solid transparent",
              color: activeTab === tab.key ? "#fff" : "#444",
              padding: "8px 20px", fontSize: 12, cursor: "pointer",
              fontWeight: activeTab === tab.key ? 700 : 400,
              marginBottom: "-1px", transition: "all 0.15s"
            }}>{tab.label}</button>
          ))}
        </div>
      </header>

      {/* TAB 1 — RANDOM QUÁN ĂN */}
      {activeTab === "quan" && (
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", gap: 24 }}>

        {/* Location bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#111115", border: "1px solid #1e1e24", padding: "8px 16px", flexWrap: "wrap", justifyContent: "center" }}>
          {loading && !spinning ? (
            <span style={{ fontSize: 11, color: "#444", animation: "pulse 1s infinite" }}>Đang tải quán ăn gần bạn...</span>
          ) : (
            <>
              <span style={{ fontSize: 12 }}>📍</span>
              <span style={{ fontSize: 11, color: "#888" }}>{areaLabel || "Chưa có vị trí"}</span>
              <span style={{ fontSize: 9, color: "#2a2a2e" }}>·</span>
              <span style={{ fontSize: 11, color: "#555" }}>bán kính {RADII.find(r => r.value === radius)?.label}</span>
              <span style={{ fontSize: 9, color: "#2a2a2e" }}>·</span>
              <span style={{ fontSize: 11, color: "#444" }}>{available.length} quán</span>
              <button className="btn" onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", color: "#e94560", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>đổi</button>
            </>
          )}
        </div>

        {error && (
          <div style={{ background: "#1a0a0e", border: "1px solid #e9456033", padding: "10px 16px", fontSize: 11, color: "#e94560", maxWidth: 480, width: "100%", textAlign: "center" }}>{error}</div>
        )}

        {/* Slot display */}
        <div style={{ width: "100%", maxWidth: 560, background: "#0d0d10", border: "1px solid #1e1e24", padding: "28px 20px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #e94560, transparent)" }} />
          <div style={{ fontSize: 9, color: "#2a2a2e", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>quán hôm nay</div>
          <SlotMachine spinning={spinning} result={result?.[0] || null} allRestaurants={available.length > 0 ? available : restaurants} />
          {!spinning && !result && !loading && (
            <div style={{ fontSize: 11, color: "#222", marginTop: 8 }}>nhấn để bắt đầu</div>
          )}
          {spinning && (
            <div style={{ fontSize: 9, color: "#e94560", letterSpacing: "0.2em", marginTop: 10, animation: "pulse 0.6s infinite" }}>đang chọn quán...</div>
          )}
        </div>

        {/* Spin button */}
        {!result && (
          <button className="btn" onClick={handleSpin}
            disabled={spinning || available.length === 0 || loading}
            style={{
              background: (spinning || loading || available.length === 0) ? "#1a0a0e" : "#e94560",
              border: "none", color: (spinning || loading || available.length === 0) ? "#444" : "#fff",
              padding: "15px 48px", fontSize: 14,
              fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700,
              letterSpacing: "0.05em", cursor: (spinning || loading) ? "default" : "pointer",
              transition: "all 0.2s",
              boxShadow: (!spinning && !loading && available.length > 0) ? "0 0 40px rgba(233,69,96,0.25)" : "none"
            }}>
            {loading ? "Đang tải..." : spinning ? "Đang quay..." : available.length === 0 ? "Hết quán rồi!" : "🎲 Bắt Đầu Chọn"}
          </button>
        )}

        {/* 3 result cards */}
        {result && !spinning && (
          <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "center" }}>
              {result.length} gợi ý cho bạn
            </div>
            {result.map((r, i) => (
              <div key={r.id} style={{ position: "relative" }}>
                {i === 0 && (
                  <div style={{ position: "absolute", top: -8, left: 16, zIndex: 1, background: "#e94560", color: "#fff", fontSize: 8, padding: "2px 8px", letterSpacing: "0.1em" }}>⭐ GỢI Ý #1</div>
                )}
                <ResultCard
                  restaurant={r}
                  userLat={userLat} userLng={userLng}
                  onReroll={() => { setResult(null); setTimeout(handleSpin, 100); }}
                  onBlacklist={handleBlacklist}
                />
              </div>
            ))}
            <button className="btn" onClick={() => { setResult(null); setTimeout(handleSpin, 100); }} style={{
              background: "transparent", border: "1px solid #1e1e24",
              color: "#555", padding: "10px", fontSize: 12, cursor: "pointer"
            }}>↺ Chọn lại 3 quán khác</button>
          </div>
        )}

        {available.length === 0 && !loading && restaurants.length > 0 && (
          <div style={{ textAlign: "center", color: "#333" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>😅</div>
            <div style={{ fontSize: 12 }}>Bạn đã bỏ qua hết quán rồi!</div>
            <button className="btn" onClick={() => setBlacklist([])} style={{ marginTop: 12, background: "none", border: "1px solid #222", color: "#555", padding: "6px 16px", fontSize: 11, cursor: "pointer" }}>Reset danh sách</button>
          </div>
        )}
      </main>
      )}

      {/* TAB 2 — RANDOM MÓN ĂN */}
      {activeTab === "mon" && (
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", gap: 24 }}>

        {/* Meal period selector */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
          {Object.entries(MEAL_LABELS).map(([key, label]) => (
            <button key={key} className="btn" onClick={() => { setSelectedMeal(key); setFoodResult(null); setFoodDisplay("???"); }} style={{
              background: selectedMeal === key ? "#e9456018" : "#111115",
              border: selectedMeal === key ? "1px solid #e9456066" : "1px solid #1e1e24",
              color: selectedMeal === key ? "#e94560" : "#555",
              padding: "8px 18px", fontSize: 12, cursor: "pointer",
              fontWeight: selectedMeal === key ? 700 : 400,
            }}>{label}</button>
          ))}
        </div>

        {/* Slot display */}
        <div style={{ width: "100%", maxWidth: 480, background: "#0d0d10", border: "1px solid #1e1e24", padding: "36px 24px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #e94560, transparent)" }} />
          <div style={{ fontSize: 9, color: "#2a2a2e", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20 }}>
            {MEAL_LABELS[selectedMeal]} — món hôm nay
          </div>

          {/* Big food name display */}
          <div style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontSize: foodSpinning ? 24 : (foodResult ? 32 : 28),
            fontWeight: 800, color: foodSpinning ? "#444" : foodResult ? "#fff" : "#2a2a2e",
            minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s", textAlign: "center", lineHeight: 1.2
          }}>
            {foodDisplay}
          </div>

          {foodSpinning && (
            <div style={{ fontSize: 9, color: "#e94560", letterSpacing: "0.2em", marginTop: 12, animation: "pulse 0.6s infinite" }}>đang chọn món...</div>
          )}
          {!foodSpinning && !foodResult && (
            <div style={{ fontSize: 11, color: "#222", marginTop: 10 }}>nhấn để bắt đầu</div>
          )}
        </div>

        {/* Spin button */}
        {!foodResult ? (
          <button className="btn" onClick={handleFoodSpin} disabled={foodSpinning || availableFoods.length === 0} style={{
            background: (foodSpinning || availableFoods.length === 0) ? "#1a0a0e" : "#e94560",
            border: "none", color: (foodSpinning || availableFoods.length === 0) ? "#444" : "#fff",
            padding: "15px 48px", fontSize: 14, fontWeight: 700,
            cursor: (foodSpinning || availableFoods.length === 0) ? "default" : "pointer",
            transition: "all 0.2s",
            boxShadow: (!foodSpinning && availableFoods.length > 0) ? "0 0 40px rgba(233,69,96,0.25)" : "none"
          }}>
            {foodSpinning ? "Đang chọn..." : availableFoods.length === 0 ? "Hết món rồi!" : "🎲 Bắt Đầu Chọn"}
          </button>
        ) : (
          <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "center" }}>3 gợi ý cho bạn</div>
            {foodResult.map((food, i) => (
              <div key={food} style={{
                background: i === 0 ? "#1a0a0e" : "#0d0d10",
                border: i === 0 ? "1px solid #e9456044" : "1px solid #1e1e24",
                padding: "14px 18px"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: i === 0 ? 10 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: i === 0 ? "#e94560" : "#1e1e24",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: i === 0 ? "#fff" : "#444", fontWeight: 700, flexShrink: 0
                    }}>{i + 1}</div>
                    <div>
                      <span style={{ fontSize: i === 0 ? 18 : 14, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? "#fff" : "#888" }}>{food}</span>
                      <span style={{ fontSize: 9, color: "#333", marginLeft: 8 }}>{getFoodGroup(food)}</span>
                    </div>
                  </div>
                  {i === 0 && <span style={{ fontSize: 8, color: "#e94560", border: "1px solid #e9456033", padding: "2px 7px" }}>GỢI Ý #1</span>}
                </div>
                {i === 0 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={`grabfood://search?keyword=${encodeURIComponent(food)}`}
                      target="_blank" rel="noreferrer"
                      style={{ flex: 1, background: "#0d1a0d", border: "1px solid #00b14f44", color: "#00b14f", padding: "8px", fontSize: 11, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      🟢 GrabFood
                    </a>
                    <a href={`shopeefood://search?keyword=${encodeURIComponent(food)}`}
                      target="_blank" rel="noreferrer"
                      style={{ flex: 1, background: "#1a0d0a", border: "1px solid #ee4d2d44", color: "#ee4d2d", padding: "8px", fontSize: 11, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      🟠 ShopeeFood
                    </a>
                  </div>
                )}
              </div>
            ))}
            <button className="btn" onClick={() => { setFoodResult(null); setFoodDisplay("???"); setTimeout(handleFoodSpin, 100); }} style={{
              background: "transparent", border: "1px solid #1e1e24",
              color: "#555", padding: "10px", fontSize: 12, cursor: "pointer"
            }}>↺ Chọn lại 3 món khác</button>
          </div>
        )}

      </main>
      )}

      {/* ── FOOD FILTER PANEL ── */}
      {showFoodFilter && (
        <div onClick={() => setShowFoodFilter(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d10", border: "1px solid #1e1e24", width: "100%", maxWidth: 480, padding: 28, animation: "slideUp 0.2s ease", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: "#fff" }}>
              Bỏ Qua Món Ăn<span style={{ color: "#e94560" }}>.</span>
            </div>

            {/* Block by group */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase" }}>BỎ QUA THEO NHÓM</div>
                {blockedFoodGroups.length > 0 && (
                  <button className="btn" onClick={() => setBlockedFoodGroups([])} style={{ background: "none", border: "none", color: "#e94560", fontSize: 9, cursor: "pointer" }}>Bỏ hết</button>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.keys(FOOD_GROUPS).map(group => {
                  const blocked = blockedFoodGroups.includes(group);
                  return (
                    <button key={group} className="btn" onClick={() => setBlockedFoodGroups(prev => blocked ? prev.filter(g => g !== group) : [...prev, group])} style={{
                      background: blocked ? "#1a0a0e" : "#111115",
                      border: blocked ? "1px solid #e9456044" : "1px solid #1e1e24",
                      color: blocked ? "#e94560" : "#888",
                      padding: "6px 14px", fontSize: 11, cursor: "pointer",
                      textDecoration: blocked ? "line-through" : "none"
                    }}>{group}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 1, background: "#1a1a1e", marginBottom: 18 }} />

            {/* Block specific foods */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase" }}>BỎ QUA MÓN CỤ THỂ ({blockedFoods.length})</div>
                {blockedFoods.length > 0 && (
                  <button className="btn" onClick={() => setBlockedFoods([])} style={{ background: "none", border: "none", color: "#e94560", fontSize: 9, cursor: "pointer" }}>Bỏ hết</button>
                )}
              </div>

              {/* Group foods by category for easier browsing */}
              <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(FOOD_GROUPS).map(([group, items]) => {
                  const mealFoods = items.filter(f => FOODS[selectedMeal].includes(f));
                  if (mealFoods.length === 0) return null;
                  return (
                    <div key={group}>
                      <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.15em", marginBottom: 6 }}>{group}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {mealFoods.map(food => {
                          const blocked = blockedFoods.includes(food);
                          return (
                            <button key={food} className="btn" onClick={() => setBlockedFoods(prev => blocked ? prev.filter(f => f !== food) : [...prev, food])} style={{
                              background: blocked ? "#1a0a0e" : "#111115",
                              border: blocked ? "1px solid #e9456033" : "1px solid #1a1a1e",
                              color: blocked ? "#e94560" : "#666",
                              padding: "4px 10px", fontSize: 10, cursor: "pointer",
                              textDecoration: blocked ? "line-through" : "none"
                            }}>{food}</button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #1a1a1e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#444" }}>{availableFoods.length} món sẽ được random</span>
              <button className="btn" onClick={() => setShowFoodFilter(false)} style={{ background: "#e94560", border: "none", color: "#fff", padding: "8px 20px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Xong</button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {showSettings && (
        <div onClick={() => setShowSettings(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d10", border: "1px solid #1e1e24", width: "100%", maxWidth: 400, padding: 28, animation: "slideUp 0.2s ease" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 22, color: "#fff" }}>Khu vực<span style={{ color: "#e94560" }}>.</span></div>

            <button className="btn" onClick={() => { getLocation(); setShowSettings(false); }} style={{ width: "100%", background: "#111115", border: "1px solid #1e1e24", color: "#888", padding: "10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              📍 Dùng vị trí GPS hiện tại
            </button>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", marginBottom: 8 }}>HOẶC NHẬP ĐỊA CHỈ</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={customAddress} onChange={e => setCustomAddress(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && geocodeAddress()}
                  placeholder="VD: 123 Nguyễn Huệ, Quận 1"
                  style={{ flex: 1, background: "#111115", border: "1px solid #1e1e24", color: "#e8e8e8", padding: "9px 12px", fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                <button className="btn" onClick={geocodeAddress} disabled={geocoding} style={{ background: "#e94560", border: "none", color: "#fff", padding: "9px 14px", fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>
                  {geocoding ? "..." : "Tìm"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", marginBottom: 8 }}>BÁN KÍNH</div>
              <div style={{ display: "flex", gap: 8 }}>
                {RADII.map(r => (
                  <button key={r.value} className="btn" onClick={() => {
                    setRadius(r.value);
                    if (userLat) loadRestaurants(userLat, userLng, r.value);
                  }} style={{
                    flex: 1, background: radius === r.value ? "#e9456018" : "transparent",
                    border: radius === r.value ? "1px solid #e9456044" : "1px solid #1e1e24",
                    color: radius === r.value ? "#e94560" : "#555",
                    padding: "8px", fontSize: 12, fontFamily: "inherit", cursor: "pointer"
                  }}>{r.label}</button>
                ))}
              </div>
            </div>

            <button className="btn" onClick={() => setShowSettings(false)} style={{ width: "100%", background: "#e94560", border: "none", color: "#fff", padding: "10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: 600 }}>Xong</button>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {showHistory && (
        <div onClick={() => setShowHistory(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d10", border: "1px solid #1e1e24", width: "100%", maxWidth: 400, padding: 28, animation: "slideUp 0.2s ease", maxHeight: "75vh", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 18, color: "#fff" }}>Lịch sử<span style={{ color: "#e94560" }}>.</span></div>
            {history.length === 0
              ? <div style={{ color: "#2a2a2e", fontSize: 12, textAlign: "center", padding: "40px 0" }}>Chưa có lịch sử</div>
              : <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#111115", border: "1px solid #1a1a1e" }}>
                    {r.photo
                      ? <img src={r.photo} alt="" style={{ width: 40, height: 40, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                      : <div style={{ width: 40, height: 40, background: "#1a1a1e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🍜</div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#e8e8e8" }}>{r.name}</div>
                      <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>{r.type}</div>
                    </div>
                    <div style={{ fontSize: 9, color: "#2a2a2e" }}>{r.time}</div>
                  </div>
                ))}
              </div>
            }
            <button className="btn" onClick={() => setShowHistory(false)} style={{ marginTop: 14, background: "none", border: "1px solid #1e1e24", color: "#555", padding: "8px", fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>Đóng</button>
          </div>
        </div>
      )}

      {/* BLACKLIST */}
      {showBlacklist && (
        <div onClick={() => setShowBlacklist(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d10", border: "1px solid #1e1e24", width: "100%", maxWidth: 400, padding: 28, animation: "slideUp 0.2s ease", maxHeight: "75vh", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 18, color: "#fff" }}>Bỏ qua<span style={{ color: "#e94560" }}>.</span></div>
            {blacklist.length === 0
              ? <div style={{ color: "#2a2a2e", fontSize: 12, textAlign: "center", padding: "40px 0" }}>Chưa bỏ qua quán nào</div>
              : <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {restaurants.filter(r => blacklist.includes(r.id)).map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#111115", border: "1px solid #1a1a1e" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#555" }}>{r.name}</div>
                      <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>{r.address}</div>
                    </div>
                    <button className="btn" onClick={() => setBlacklist(prev => prev.filter(b => b !== r.id))} style={{ background: "none", border: "1px solid #2a2a2e", color: "#666", padding: "4px 10px", fontSize: 10, fontFamily: "inherit", cursor: "pointer" }}>Bỏ chặn</button>
                  </div>
                ))}
              </div>
            }
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {blacklist.length > 0 && <button className="btn" onClick={() => setBlacklist([])} style={{ flex: 1, background: "none", border: "1px solid #2a2a2e", color: "#555", padding: "8px", fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>Reset tất cả</button>}
              <button className="btn" onClick={() => setShowBlacklist(false)} style={{ flex: 1, background: "none", border: "1px solid #1e1e24", color: "#444", padding: "8px", fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DANH SÁCH BỎ QUA PANEL ── */}
      {showFilter && (
        <div onClick={() => setShowFilter(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d10", border: "1px solid #1e1e24", width: "100%", maxWidth: 440, padding: 28, animation: "slideUp 0.2s ease", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: "#fff" }}>
              Danh Sách Bỏ Qua<span style={{ color: "#e94560" }}>.</span>
            </div>

            {/* Loại ẩm thực */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase" }}>LOẠI ẨM THỰC</div>
                {blockedTypes.length > 0 && (
                  <button className="btn" onClick={() => setBlockedTypes([])} style={{ background: "none", border: "none", color: "#e94560", fontSize: 9, cursor: "pointer" }}>Bỏ hết</button>
                )}
              </div>
              {allTypes.length === 0
                ? <div style={{ fontSize: 11, color: "#333" }}>Tải quán trước để xem loại ẩm thực</div>
                : <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {allTypes.map(t => {
                    const blocked = blockedTypes.includes(t);
                    return (
                      <button key={t} className="btn" onClick={() => setBlockedTypes(prev => blocked ? prev.filter(x => x !== t) : [...prev, t])} style={{
                        background: blocked ? "#1a0a0e" : "#111115",
                        border: blocked ? "1px solid #e9456044" : "1px solid #1e1e24",
                        color: blocked ? "#e94560" : "#888",
                        padding: "5px 12px", fontSize: 11, cursor: "pointer",
                        textDecoration: blocked ? "line-through" : "none"
                      }}>{t}</button>
                    );
                  })}
                </div>
              }
            </div>

            <div style={{ height: 1, background: "#1a1a1e", marginBottom: 16 }} />

            {/* Quán cụ thể */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  QUÁN CỤ THỂ ({blacklist.length} bỏ qua)
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {blacklist.length > 0 && (
                    <button className="btn" onClick={() => setBlacklist([])} style={{ background: "none", border: "none", color: "#e94560", fontSize: 9, cursor: "pointer" }}>Bỏ hết</button>
                  )}
                  <button className="btn" onClick={() => setShowAddManual(true)} style={{ background: "none", border: "1px solid #e9456044", color: "#e94560", fontSize: 9, cursor: "pointer", padding: "2px 8px" }}>+ Thêm quán</button>
                </div>
              </div>
              <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {allRestaurants.length === 0
                  ? <div style={{ fontSize: 11, color: "#333" }}>Tải quán trước</div>
                  : allRestaurants.map(r => {
                    const blocked = blacklist.includes(r.id);
                    return (
                      <div key={r.id} onClick={() => setBlacklist(prev => blocked ? prev.filter(x => x !== r.id) : [...prev, r.id])}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: blocked ? "#1a0a0e" : "#111115", border: blocked ? "1px solid #e9456022" : "1px solid #1a1a1e", cursor: "pointer" }}>
                        <div style={{ width: 18, height: 18, border: `1px solid ${blocked ? "#e94560" : "#333"}`, background: blocked ? "#e94560" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>
                          {blocked ? "✕" : ""}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ fontSize: 12, color: blocked ? "#666" : "#e8e8e8", textDecoration: blocked ? "line-through" : "none" }}>{r.name}</div>
                            {r.isManual && <span style={{ fontSize: 8, color: "#f97316", border: "1px solid #f9731633", padding: "1px 5px" }}>thủ công</span>}
                          </div>
                          <div style={{ fontSize: 9, color: "#333", marginTop: 1 }}>{r.type}</div>
                        </div>
                        {r.isManual && (
                          <button onClick={e => { e.stopPropagation(); setManualRestaurants(prev => prev.filter(m => m.id !== r.id)); }} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>🗑</button>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #1a1a1e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#444" }}>{available.length} quán sẽ được random</span>
              <button className="btn" onClick={() => setShowFilter(false)} style={{ background: "#e94560", border: "none", color: "#fff", padding: "8px 20px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Xong</button>
            </div>
          </div>
        </div>
      )}

      {/* ── THÊM QUÁN THỦ CÔNG ── */}
      {showAddManual && (
        <div onClick={() => setShowAddManual(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d10", border: "1px solid #1e1e24", width: "100%", maxWidth: 380, padding: 28, animation: "slideUp 0.2s ease" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "#fff" }}>
              Thêm quán<span style={{ color: "#e94560" }}>.</span>
            </div>

            {[
              { label: "TÊN QUÁN *", value: manualName, set: setManualName, placeholder: "VD: Phở Hà Nội" },
              { label: "ĐỊA CHỈ", value: manualAddress, set: setManualAddress, placeholder: "VD: 12 Lê Lợi, Quận 1" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", marginBottom: 6 }}>{label}</div>
                <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                  style={{ width: "100%", background: "#111115", border: "1px solid #1e1e24", color: "#e8e8e8", padding: "9px 12px", fontSize: 12, outline: "none" }} />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", marginBottom: 6 }}>LOẠI</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Quán ăn", "Phở", "Bún", "Cơm", "Bánh mì", "Cafe", "Lẩu", "Khác"].map(t => (
                  <button key={t} className="btn" onClick={() => setManualType(t)} style={{
                    background: manualType === t ? "#e9456018" : "transparent",
                    border: manualType === t ? "1px solid #e9456044" : "1px solid #1e1e24",
                    color: manualType === t ? "#e94560" : "#555",
                    padding: "4px 10px", fontSize: 11, cursor: "pointer"
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => setShowAddManual(false)} style={{ flex: 1, background: "none", border: "1px solid #1e1e24", color: "#555", padding: "9px", fontSize: 11, cursor: "pointer" }}>Huỷ</button>
              <button className="btn" onClick={handleAddManual} disabled={!manualName.trim()} style={{ flex: 2, background: manualName.trim() ? "#e94560" : "#1e1a1a", border: "none", color: manualName.trim() ? "#fff" : "#444", padding: "9px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Thêm vào danh sách</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}