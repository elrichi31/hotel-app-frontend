"use client";
import React, { useEffect, useState } from "react";
import { Segmented, Spin, Alert } from "antd";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  FileText,
  Calendar,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Line,
  LineChart,
} from "recharts";
import { notion, viz } from "@/lib/theme";
import DashboardService, { DashboardStats } from "@/services/DashboardService";

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */

const money = (n: number) =>
  "$" + new Intl.NumberFormat("es", { maximumFractionDigits: 0 }).format(n);
const pct = (n: number) =>
  new Intl.NumberFormat("es", { maximumFractionDigits: 0 }).format(n) + "%";

/* ------------------------------------------------------------------ */
/* Piezas compartidas                                                  */
/* ------------------------------------------------------------------ */

const card = {
  background: notion.cardBg,
  border: `1px solid ${notion.divider}`,
  borderRadius: 12,
} as const;

/** Chip de variación: flecha + porcentaje, menta si mejora, coral si empeora. */
const Delta = ({ value }: { value: number }) => {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        color: up ? viz.positive : viz.negative,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <Icon size={11} />
      {Math.abs(value)}%
    </span>
  );
};

const ChartTooltip = ({ active, payload, label, prefix, unit }: any) => {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p: any) => p.value !== null && p.value !== undefined);
  if (!rows.length) return null;
  return (
    <div
      style={{
        background: "#232323",
        border: `1px solid ${notion.divider}`,
        borderRadius: notion.radius,
        padding: "8px 10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        fontSize: 13,
        minWidth: 150,
      }}
    >
      <div style={{ color: notion.inkFaint, marginBottom: 5 }}>
        {prefix}
        {label}
      </div>
      {rows.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{ width: 7, height: 7, borderRadius: 2, background: p.color, flexShrink: 0 }}
          />
          <span style={{ color: notion.inkMuted }}>{p.name}</span>
          <span style={{ color: notion.ink, fontWeight: 500, marginLeft: "auto" }}>
            {unit === "plain" ? p.value : money(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: viz.axisText, fontSize: 11 },
} as const;

const sectionTitle = { fontSize: 15, fontWeight: 600, color: notion.ink } as const;
const sectionNote = { fontSize: 12.5, color: notion.inkMuted, marginTop: 3 } as const;

/** Pastilla muted de contexto ("Este mes"): rellena el espacio bajo el número, como en la referencia. */
const PeriodChip = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 9px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.06)",
      color: notion.inkMuted,
      fontSize: 11.5,
      fontWeight: 500,
      width: "fit-content",
    }}
  >
    {children}
  </span>
);

/** Tooltip compacto para las mini-gráficas de las tarjetas: un solo valor, sin ejes. */
const MiniTooltip = ({ active, payload, plain }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  if (p.value === null || p.value === undefined) return null;
  return (
    <div
      style={{
        background: "#232323",
        border: `1px solid ${notion.divider}`,
        borderRadius: 8,
        padding: "5px 9px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        fontSize: 12,
        color: notion.ink,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {plain ? p.value : money(p.value)}
    </div>
  );
};

/** Tarjeta compacta de estadística: ícono en badge, delta, valor grande, chip de contexto y mini-gráfica. */
const StatTile = ({
  icon,
  color,
  label,
  value,
  delta,
  chip,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  delta?: number;
  chip?: string;
  children?: React.ReactNode;
}) => (
  <div style={{ ...card, padding: 18, display: "flex", flexDirection: "column", minHeight: 190 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: `${color}1f`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        {icon}
      </span>
      {delta !== undefined && <Delta value={delta} />}
    </div>
    <div style={{ fontSize: 22, fontWeight: 600, color: notion.ink, marginTop: 14 }}>{value}</div>
    <div style={{ fontSize: 12.5, color: notion.inkMuted, marginTop: 2 }}>{label}</div>
    {chip && (
      <div style={{ marginTop: 10 }}>
        <PeriodChip>{chip}</PeriodChip>
      </div>
    )}
    <div style={{ flex: 1, minHeight: 44, marginTop: 12 }}>{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Vista                                                               */
/* ------------------------------------------------------------------ */

export default function VentasDashboard({ token }: { token: string }) {
  const [mode, setMode] = useState<"Diario" | "Acumulado">("Diario");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardService.getStats(token);
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar el panel");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stats) {
    return <Alert type="error" showIcon message="Error" description={error || "No se pudo cargar el panel"} />;
  }

  const cumulative = (() => {
    let a = 0;
    let b = 0;
    return stats.revenue.daily.map((d) => {
      if (d.actual !== null) a += d.actual;
      b += d.anterior;
      return { day: d.day, actual: d.actual === null ? null : a, anterior: b };
    });
  })();

  const data = mode === "Diario" ? stats.revenue.daily : cumulative;
  const roomTotal = stats.roomTypes.reduce((s, r) => s + r.revenue, 0) || 1;
  const topThreeShare = (stats.roomTypes.slice(0, 3).reduce((s, r) => s + r.revenue, 0) / roomTotal) * 100;
  const busiestDay = stats.weekday.reduce((a, b) => (b.checkins > a.checkins ? b : a), stats.weekday[0]);
  const occupancyPct = stats.occupancy.total > 0 ? (stats.occupancy.ocupadas / stats.occupancy.total) * 100 : 0;

  const facturasColors = [viz.positive, viz.neutral, viz.negative];
  const facturasConColor = stats.facturasPorEstado.map((f, i) => ({ ...f, color: facturasColors[i] }));

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, color: notion.ink, margin: 0 }}>
        Panel de rendimiento
      </h1>
      <p style={{ color: notion.inkMuted, marginTop: 4, marginBottom: 18, fontSize: 14 }}>
        Ingresos y ocupación del mes en curso
      </p>

      {/* ---------------- Tarjetas de estadística ------------------------------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <StatTile
          icon={<ShoppingCart size={16} />}
          color={viz.series2}
          label="Ventas del mes"
          value={String(stats.orders.total)}
          chip="Este mes"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weekday}>
              <Tooltip content={<MiniTooltip plain />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="checkins" fill={viz.series2} radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </StatTile>

        <StatTile
          icon={<DollarSign size={16} />}
          color={viz.series3}
          label="Facturado (emitido)"
          value={money(stats.facturas.total)}
          delta={stats.facturas.delta}
          chip="Este mes"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.roomTypes}>
              <Tooltip content={<MiniTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="revenue" fill={viz.series3} radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </StatTile>

        <StatTile
          icon={<Calendar size={16} />}
          color={viz.series1}
          label="Reservas nuevas"
          value={String(stats.reservas.total)}
          delta={stats.reservas.delta}
          chip="Últimos 30 días"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip content={<MiniTooltip />} cursor={{ stroke: notion.divider, strokeWidth: 1 }} />
              <Line type="monotone" dataKey="actual" stroke={viz.series1} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </StatTile>

        <StatTile
          icon={<FileText size={16} />}
          color={viz.positive}
          label="Ingresos totales"
          value={money(stats.revenue.total)}
          delta={stats.revenue.delta}
          chip="Este mes"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weekday}>
              <Tooltip content={<MiniTooltip plain />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="checkins" fill={viz.positive} radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </StatTile>
      </div>

      {/* ---------------- Evolución: serie actual + mes anterior punteado -------- */}
      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={sectionTitle}>Evolución de ingresos</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: notion.ink, lineHeight: 1 }}>
                {money(stats.revenue.total)}
              </span>
              <Delta value={stats.revenue.delta} />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: notion.inkMuted }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: viz.series1 }} />
                Actual
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: notion.inkMuted }}>
                <span
                  style={{
                    width: 14,
                    height: 0,
                    borderTop: `1.5px dashed ${viz.comparison}`,
                    display: "inline-block",
                  }}
                />
                Mes anterior
              </span>
            </div>
          </div>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as "Diario" | "Acumulado")}
            options={["Diario", "Acumulado"]}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -14 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={viz.series1} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={viz.series1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={viz.grid} vertical={false} />
              <XAxis dataKey="day" {...axisProps} interval={2} />
              <YAxis
                {...axisProps}
                width={54}
                tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)}
              />
              <Tooltip
                content={<ChartTooltip prefix="Día " />}
                cursor={{ stroke: notion.divider, strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="anterior"
                name="Mes anterior"
                stroke={viz.comparison}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke={viz.series1}
                strokeWidth={2}
                fill="url(#fillRevenue)"
                connectNulls={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: notion.cardBg }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* -------- Tipos de habitación (lista de barras) + facturas (dona) ----------- */}
      <div
        className="dash-split"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ ...card, padding: 20 }}>
          <div style={sectionTitle}>Ingresos por tipo de habitación</div>
          <div style={{ ...sectionNote, marginBottom: 18 }}>
            {stats.roomTypes.length > 0 ? (
              <>
                Los 3 principales concentran el{" "}
                <strong style={{ color: notion.ink }}>{pct(topThreeShare)}</strong> del total
              </>
            ) : (
              "Todavía no hay ventas registradas"
            )}
          </div>

          {stats.roomTypes.map((r) => {
            const share = (r.revenue / roomTotal) * 100;
            return (
              <div key={r.name} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 13.5, color: notion.ink }}>{r.name}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 13.5,
                      color: notion.ink,
                      fontWeight: 500,
                      minWidth: 62,
                      textAlign: "right",
                    }}
                  >
                    {money(r.revenue)}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: notion.track, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${share}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: viz.series1,
                    }}
                  />
                </div>
                <div style={{ fontSize: 11.5, color: notion.inkFaint, marginTop: 5 }}>
                  {pct(share)} · {r.nights} noches
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ ...card, padding: 20 }}>
          <div style={sectionTitle}>Facturas por estado</div>
          <div style={{ height: 176, marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={facturasConColor}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {facturasConColor.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit="plain" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 14 }}>
            {facturasConColor.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: c.color, flexShrink: 0 }} />
                <span style={{ color: notion.inkMuted }}>{c.name}</span>
                <span style={{ marginLeft: "auto", color: notion.ink, fontWeight: 500 }}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Patrón semanal + ocupación ---------------------------- */}
      <div
        className="dash-split"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.35fr)", gap: 16, marginBottom: 16 }}
      >
        <div style={{ ...card, padding: 20 }}>
          <div style={sectionTitle}>Patrón semanal</div>
          <div style={{ ...sectionNote, marginBottom: 10 }}>
            Más entradas los <strong style={{ color: notion.ink }}>{busiestDay?.day ?? '—'}</strong>
          </div>
          <ResponsiveContainer width="100%" height={196}>
            <BarChart data={stats.weekday} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={viz.grid} vertical={false} />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} width={40} />
              <Tooltip content={<ChartTooltip unit="plain" />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="checkins" name="Entradas" barSize={22} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {stats.weekday.map((d) => (
                  <Cell key={d.day} fill={d.day === busiestDay?.day ? viz.series1 : viz.muted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...card, padding: 20 }}>
          <div style={sectionTitle}>Ocupación actual</div>
          <div style={{ ...sectionNote, marginBottom: 16 }}>
            <strong style={{ color: notion.ink }}>{pct(occupancyPct)}</strong> de las habitaciones están ocupadas
          </div>

          <div style={{ height: 8, borderRadius: 4, background: notion.track, overflow: "hidden" }}>
            <div style={{ width: `${occupancyPct}%`, height: "100%", background: viz.series1 }} />
          </div>

          <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: notion.inkMuted }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: viz.series1 }} />
                Ocupadas
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: notion.ink, marginTop: 6 }}>{stats.occupancy.ocupadas}</div>
              <div style={{ fontSize: 11.5, color: notion.inkFaint, marginTop: 2 }}>de {stats.occupancy.total} habitaciones</div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: notion.inkMuted }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: notion.track }} />
                Libres
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: notion.ink, marginTop: 6 }}>{stats.occupancy.libres}</div>
              <div style={{ fontSize: 11.5, color: notion.inkFaint, marginTop: 2 }}>disponibles hoy</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Huéspedes ------------------------------------------------ */}
      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: `${viz.series2}1f`,
              color: viz.series2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            <Users size={16} />
          </span>
          <div>
            <div style={sectionTitle}>Huéspedes registrados</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 2 }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: notion.ink, lineHeight: 1 }}>
                {stats.huespedes.total}
              </span>
              <Delta value={stats.huespedes.delta} />
            </div>
          </div>
        </div>

        {stats.huespedes.porProcedencia.length > 0 && (() => {
          const guestColors = [viz.series1, viz.series2, viz.series3];
          return (
            <div style={{ marginTop: 16 }}>
              {/* Barra apilada: la proporción se ve antes de leer el número */}
              <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: notion.track }}>
                {stats.huespedes.porProcedencia.map((p, i) => (
                  <div key={p.name} style={{ width: `${p.pct}%`, background: guestColors[i], height: "100%" }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 14, flexWrap: "wrap" }}>
                {stats.huespedes.porProcedencia.map((p, i) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: guestColors[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: notion.inkMuted }}>{p.name}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: notion.ink }}>{pct(p.pct)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ---------------- Top habitaciones: ingresos + noches ---------------------- */}
      <div
        className="dash-split"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}
      >
        <div style={{ ...card, padding: 20 }}>
          <div style={sectionTitle}>Top habitaciones por ingresos</div>
          <div style={{ marginTop: 14 }}>
            {stats.topRooms.length === 0 ? (
              <div style={{ fontSize: 13, color: notion.inkFaint }}>Todavía no hay ventas registradas.</div>
            ) : (
              stats.topRooms.map((r) => (
                <div
                  key={r.numero}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    borderTop: `1px solid ${notion.divider}`,
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: `${viz.series1}1f`,
                      color: viz.series1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {r.numero}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: notion.ink, fontWeight: 500 }}>Habitación {r.numero}</div>
                    <div style={{ fontSize: 12, color: notion.inkFaint }}>{r.tipo}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: notion.ink }}>{money(r.revenue)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ ...card, padding: 20 }}>
          <div style={sectionTitle}>Top habitaciones por noches</div>
          <div style={{ marginTop: 14 }}>
            {stats.topRoomsByNights.length === 0 ? (
              <div style={{ fontSize: 13, color: notion.inkFaint }}>Todavía no hay ventas registradas.</div>
            ) : (
              stats.topRoomsByNights.map((r) => (
                <div
                  key={r.numero}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    borderTop: `1px solid ${notion.divider}`,
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: `${viz.series2}1f`,
                      color: viz.series2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {r.numero}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: notion.ink, fontWeight: 500 }}>Habitación {r.numero}</div>
                    <div style={{ fontSize: 12, color: notion.inkFaint }}>{r.tipo}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: notion.ink }}>{r.nights} noches</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
