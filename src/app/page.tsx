"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Drawer } from "antd";
import {
  CalendarRange,
  Users,
  LineChart,
  CheckCircle2,
  Menu as MenuIcon,
  ArrowRight,
  Home,
  X,
  Circle,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notion, viz } from "@/lib/theme";

/** Aparece enfocándose (blur + escala + traslado) al llegar al viewport; una sola vez. */
function Reveal({
  children,
  delay = 0,
  className = "",
  side,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  side?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-side={side}
      className={`${side ? "reveal-side" : "reveal"} ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const NAV_LINKS = [
  { href: "#features", label: "Características" },
  { href: "#how", label: "Cómo funciona" },
  { href: "#pricing", label: "Precios" },
];

const PLANS = [
  {
    name: "Básico",
    tagline: "Para pequeños hoteles y B&Bs",
    price: "$49",
    period: "/mes",
    highlight: false,
    items: ["Hasta 20 habitaciones", "Reportes básicos", "Soporte por correo"],
  },
  {
    name: "Profesional",
    tagline: "Para hoteles medianos",
    price: "$99",
    period: "/mes",
    highlight: true,
    items: ["Hasta 100 habitaciones", "Analíticas avanzadas", "Soporte telefónico 24/7"],
  },
  {
    name: "Empresarial",
    tagline: "Para grandes cadenas de hoteles",
    price: "Personalizado",
    period: "",
    highlight: false,
    items: ["Habitaciones ilimitadas", "Integraciones personalizadas", "Gestor de cuentas dedicado"],
  },
];

/** Rejilla de habitaciones estilizada — representa el mapa de reservas, no una captura real. */
function RoomsMockup() {
  const occupied = new Set([2, 5, 8, 9, 14, 17, 20, 21, 23]);
  return (
    <div
      className="landing-card w-full rounded-2xl p-6"
      style={{ background: notion.cardBg, border: `1px solid ${notion.divider}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: notion.ink }}>
          Mapa de habitaciones
        </span>
        <span className="text-xs" style={{ color: notion.inkFaint }}>
          Hoy
        </span>
      </div>
      <div className="mt-5 grid grid-cols-6 gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-md"
            style={{
              background: occupied.has(i) ? `${viz.series1}33` : notion.track,
              border: `1px solid ${occupied.has(i) ? viz.series1 : notion.divider}`,
            }}
          />
        ))}
      </div>
      <div className="mt-5 flex items-center gap-4 text-xs" style={{ color: notion.inkMuted }}>
        <span className="flex items-center gap-1.5">
          <Circle size={8} fill={viz.series1} color={viz.series1} /> Ocupada
        </span>
        <span className="flex items-center gap-1.5">
          <Circle size={8} fill={notion.track} color={notion.divider} /> Disponible
        </span>
      </div>
    </div>
  );
}

/** Tarjetas de huéspedes estilizadas — representación, no datos reales. */
function GuestsMockup() {
  const guests = [
    { name: "Elena Ríos", stay: "Suite 204 · 3 noches", color: viz.series1 },
    { name: "Marco Duarte", stay: "Doble 118 · 1 noche", color: viz.series2 },
    { name: "Carla Núñez", stay: "Suite 310 · 5 noches", color: viz.series3 },
    { name: "Iván Salas", stay: "Individual 022 · 2 noches", color: viz.series1 },
  ];
  return (
    <div
      className="landing-card w-full rounded-2xl p-6"
      style={{ background: notion.cardBg, border: `1px solid ${notion.divider}` }}
    >
      <span className="text-sm font-medium" style={{ color: notion.ink }}>
        Huéspedes activos
      </span>
      <div className="mt-4 flex flex-col gap-1">
        {guests.map((g) => (
          <div key={g.name} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: `${g.color}22`, color: g.color }}
            >
              {g.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm" style={{ color: notion.ink }}>
                {g.name}
              </p>
              <p className="truncate text-xs" style={{ color: notion.inkFaint }}>
                {g.stay}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Panel de analíticas estilizado — ilustra la vista, no reporta cifras reales. */
function AnalyticsMockup() {
  const bars = [38, 52, 44, 61, 58, 70, 66, 78, 74, 84];
  return (
    <div
      className="landing-card w-full rounded-2xl p-6"
      style={{ background: notion.cardBg, border: `1px solid ${notion.divider}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: notion.ink }}>
          Ocupación semanal
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: `${viz.positive}22`, color: viz.positive }}
        >
          En alza
        </span>
      </div>
      <div className="mt-6 flex h-32 items-end gap-2">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h}%`,
              background: i === bars.length - 1 ? viz.series1 : `${viz.series1}55`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-xs" style={{ color: notion.inkFaint }}>
        <span>Lun</span>
        <span>Dom</span>
      </div>
    </div>
  );
}

const SHOWCASES = [
  {
    eyebrow: "RESERVAS",
    title: "Cada reserva, exactamente donde debe estar.",
    body: "Asigna habitaciones, gestiona check-in y check-out y evita overbooking desde un mapa visual que responde al instante. Sin pestañas cruzadas, sin hojas de cálculo.",
    color: viz.series1,
    Mockup: RoomsMockup,
  },
  {
    eyebrow: "HUÉSPEDES",
    title: "Conoce a cada huésped antes de que cruce la puerta.",
    body: "Historial de estadías, preferencias y contacto directo en un mismo perfil. La atención personalizada deja de depender de la memoria del equipo.",
    color: viz.series2,
    Mockup: GuestsMockup,
  },
  {
    eyebrow: "ANALÍTICAS",
    title: "Los números de tu hotel, en tiempo real.",
    body: "Ocupación, ingresos y desempeño por habitación actualizados al minuto, para decidir con datos en vez de intuición.",
    color: viz.series3,
    Mockup: AnalyticsMockup,
  },
];

const STEPS = [
  { n: "01", title: "Configura", body: "Carga tus habitaciones, tarifas y equipo en minutos, sin ayuda técnica." },
  { n: "02", title: "Conecta", body: "Sincroniza reservas de todos tus canales en un único calendario." },
  { n: "03", title: "Opera", body: "Gestiona el día a día del hotel desde un panel pensado para moverse rápido." },
];

const PaginaPrincipal: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogin = () => router.push("/login");
  const handleRegister = () => router.push("/register");
  const handleDashboard = () => router.push("/dashboard");
  const handleLogout = () => signOut();

  return (
    <div style={{ background: notion.pageBg, minHeight: "100vh" }}>
      {/* Encabezado: barra flotante tipo "pill", separada del borde superior */}
      <header className="sticky top-0 z-30 px-4 pt-4 lg:px-8">
        <div
          className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full pl-3 pr-2"
          style={{
            background: scrolled ? `${notion.sidebarBg}e6` : `${notion.sidebarBg}99`,
            backdropFilter: "blur(16px) saturate(160%)",
            WebkitBackdropFilter: "blur(16px) saturate(160%)",
            border: `1px solid ${scrolled ? notion.divider : "rgba(255,255,255,0.06)"}`,
            boxShadow: scrolled ? "0 8px 30px -12px rgba(0,0,0,0.6)" : "none",
            transition: "background 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
          }}
        >
          <Link href="/" className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: `${viz.series1}22`, color: viz.series1 }}
            >
              <Home size={15} />
            </span>
            <span className="text-[14px] font-semibold" style={{ color: notion.ink }}>
              HotelApp
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-sm transition-colors"
                style={{ color: notion.inkMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = notion.ink;
                  e.currentTarget.style.background = notion.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = notion.inkMuted;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1.5">
            {status === "authenticated" ? (
              <>
                <Button shape="round" onClick={handleDashboard}>
                  Dashboard
                </Button>
                <Button shape="round" type="primary" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button shape="round" type="text" onClick={handleLogin} style={{ color: notion.inkMuted }}>
                  Iniciar sesión
                </Button>
                <Button shape="round" type="primary" className="landing-press" onClick={handleRegister}>
                  Comenzar gratis
                </Button>
              </>
            )}
          </div>

          <button
            className="landing-press flex h-9 w-9 items-center justify-center md:hidden"
            style={{ color: notion.ink }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          >
            <MenuIcon size={20} />
          </button>
        </div>
      </header>

      {/* Menú lateral para dispositivos móviles */}
      <Drawer
        title={<span style={{ color: notion.ink }}>Menú</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closeIcon={<X size={18} color={notion.inkMuted} />}
        width={280}
      >
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm"
              style={{ color: notion.inkMuted }}
              onClick={() => setDrawerOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t px-3 pt-6" style={{ borderColor: notion.divider }}>
          {status === "authenticated" ? (
            <>
              <Button block onClick={handleDashboard}>
                Dashboard
              </Button>
              <Button block type="primary" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button block onClick={handleLogin}>
                Iniciar sesión
              </Button>
              <Button block type="primary" onClick={handleRegister}>
                Comenzar gratis
              </Button>
            </>
          )}
        </div>
      </Drawer>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4">
          <div
            aria-hidden
            className="drift-a pointer-events-none absolute left-1/2 top-[-10%] h-[560px] w-[820px] -translate-x-1/2 rounded-full"
            style={{ background: `radial-gradient(closest-side, ${viz.series1}2e, transparent)` }}
          />
          <div
            aria-hidden
            className="drift-b pointer-events-none absolute right-[8%] top-[18%] h-[380px] w-[380px] rounded-full"
            style={{ background: `radial-gradient(closest-side, ${viz.series2}22, transparent)` }}
          />

          <div className="relative mx-auto max-w-4xl py-28 text-center md:py-36 lg:py-44">
            <Reveal>
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{ color: notion.inkMuted, background: notion.cardBg, border: `1px solid ${notion.divider}` }}
              >
                Software de gestión hotelera
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1
                className="mt-7 text-balance font-semibold"
                style={{
                  color: notion.ink,
                  fontSize: "clamp(3rem, 8vw, 6.5rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.035em",
                }}
              >
                Tu hotel.
                <br />
                <span style={{ color: viz.series1 }}>En total control.</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p
                className="mx-auto mt-8 max-w-xl text-balance leading-relaxed"
                style={{ color: notion.inkMuted, fontSize: "clamp(1.05rem, 2vw, 1.35rem)" }}
              >
                Reservas, huéspedes y reportes en un solo lugar. La forma más simple de
                dirigir una operación hotelera moderna.
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  type="primary"
                  size="large"
                  className="landing-press"
                  onClick={handleRegister}
                  icon={<ArrowRight size={16} />}
                  iconPosition="end"
                >
                  Comenzar gratis
                </Button>
                <a href="#pricing">
                  <Button size="large" className="landing-press">
                    Ver planes
                  </Button>
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={360} className="relative mx-auto max-w-4xl px-2 pb-24 md:pb-32">
            <div
              className="landing-card rounded-3xl p-3"
              style={{
                background: "#101010",
                border: `1px solid ${notion.divider}`,
                boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7)",
              }}
            >
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: viz.series3 }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#eab308" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: viz.series2 }} />
              </div>
              <div className="grid gap-3 p-2 md:grid-cols-3">
                <RoomsMockup />
                <GuestsMockup />
                <AnalyticsMockup />
              </div>
            </div>
          </Reveal>
        </section>

        {/* Showcases alternados */}
        <section id="features">
          <div className="mx-auto max-w-6xl px-4 py-10 text-center md:py-16">
            <Reveal>
              <h2
                className="font-semibold"
                style={{ color: notion.ink, fontSize: "clamp(2rem, 4.5vw, 3.25rem)", letterSpacing: "-0.02em" }}
              >
                Diseñado para la operación diaria
              </h2>
            </Reveal>
          </div>

          {SHOWCASES.map((s, i) => {
            const reversed = i % 2 === 1;
            return (
              <div key={s.title} className="mx-auto max-w-6xl px-4 py-16 md:py-24">
                <div
                  className={`grid items-center gap-10 md:gap-16 lg:grid-cols-2 ${
                    reversed ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <Reveal side={reversed ? "right" : "left"}>
                    <span
                      className="text-xs font-semibold tracking-widest"
                      style={{ color: s.color, letterSpacing: "0.12em" }}
                    >
                      {s.eyebrow}
                    </span>
                    <h3
                      className="mt-4 text-balance font-semibold"
                      style={{ color: notion.ink, fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-5 max-w-md text-base leading-relaxed md:text-lg" style={{ color: notion.inkMuted }}>
                      {s.body}
                    </p>
                  </Reveal>
                  <Reveal side={reversed ? "left" : "right"} delay={120}>
                    <s.Mockup />
                  </Reveal>
                </div>
              </div>
            );
          })}
        </section>

        {/* Cómo funciona */}
        <section id="how" className="px-4 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="font-semibold" style={{ color: notion.ink, fontSize: "clamp(2rem, 4.5vw, 3.25rem)", letterSpacing: "-0.02em" }}>
                Cómo funciona
              </h2>
              <p className="mt-4 text-base md:text-lg" style={{ color: notion.inkMuted }}>
                De cero a operando, en tres pasos.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 100}>
                  <span
                    className="font-semibold"
                    style={{ color: notion.divider, fontSize: "clamp(3rem, 6vw, 4.5rem)", letterSpacing: "-0.03em" }}
                  >
                    {step.n}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold" style={{ color: notion.ink }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed md:text-base" style={{ color: notion.inkMuted }}>
                    {step.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Precios */}
        <section id="pricing" className="px-4 py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-xl text-center">
              <h2 className="font-semibold" style={{ color: notion.ink, fontSize: "clamp(2rem, 4.5vw, 3.25rem)", letterSpacing: "-0.02em" }}>
                Precios simples y transparentes
              </h2>
              <p className="mt-4 text-base md:text-lg" style={{ color: notion.inkMuted }}>
                Elige el plan según el tamaño de tu propiedad. Cambia cuando lo necesites.
              </p>
            </Reveal>

            <div className="mt-14 grid items-start gap-5 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 90}>
                  <div
                    className="landing-card relative h-full rounded-2xl p-7"
                    style={{
                      background: plan.highlight ? "#1c1c1c" : notion.cardBg,
                      border: `1px solid ${plan.highlight ? viz.series1 : notion.divider}`,
                    }}
                  >
                    {plan.highlight && (
                      <span
                        className="absolute -top-3 left-7 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: viz.series1, color: "#fff" }}
                      >
                        Más elegido
                      </span>
                    )}
                    <h3 className="text-base font-semibold" style={{ color: notion.ink }}>
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: notion.inkMuted }}>
                      {plan.tagline}
                    </p>
                    <div className="mt-6 mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight" style={{ color: notion.ink }}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm" style={{ color: notion.inkFaint }}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {plan.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm" style={{ color: notion.inkMuted }}>
                          <CheckCircle2 size={16} style={{ color: viz.series2, flexShrink: 0, marginTop: 2 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button
                      block
                      size="large"
                      type={plan.highlight ? "primary" : "default"}
                      className="landing-press mt-7"
                      onClick={handleRegister}
                    >
                      {plan.price === "Personalizado" ? "Contactar ventas" : "Elegir plan"}
                    </Button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="relative overflow-hidden px-4 py-24 text-center md:py-32">
          <div
            aria-hidden
            className="drift-a pointer-events-none absolute left-1/2 top-0 h-[260px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: `radial-gradient(closest-side, ${viz.series1}22, transparent)`, filter: "blur(30px)" }}
          />
          <Reveal className="relative mx-auto max-w-2xl">
            <h2
              className="text-balance font-semibold"
              style={{ color: notion.ink, fontSize: "clamp(2.25rem, 6vw, 4rem)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
            >
              Empieza a dirigir tu hotel hoy.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base md:text-lg" style={{ color: notion.inkMuted }}>
              Crea tu cuenta y ten tu operación funcionando en minutos.
            </p>
            <div className="mt-9">
              <Button
                type="primary"
                size="large"
                className="landing-press"
                onClick={handleRegister}
                icon={<ArrowRight size={16} />}
                iconPosition="end"
              >
                Comenzar gratis
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="px-4 pt-16 pb-8" style={{ background: notion.pageBg }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 md:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: `${viz.series1}22`, color: viz.series1 }}
                >
                  <Home size={15} />
                </span>
                <span className="text-[15px] font-semibold" style={{ color: notion.ink }}>
                  HotelApp
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: notion.inkFaint }}>
                Software de gestión hotelera para dirigir reservas, huéspedes y reportes
                desde un solo lugar.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest" style={{ color: notion.inkFaint, letterSpacing: "0.1em" }}>
                PRODUCTO
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: notion.inkMuted }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = notion.ink)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = notion.inkMuted)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest" style={{ color: notion.inkFaint, letterSpacing: "0.1em" }}>
                CUENTA
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <button
                    onClick={handleLogin}
                    className="text-sm transition-colors"
                    style={{ color: notion.inkMuted }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = notion.ink)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = notion.inkMuted)}
                  >
                    Iniciar sesión
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleRegister}
                    className="text-sm transition-colors"
                    style={{ color: notion.inkMuted }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = notion.ink)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = notion.inkMuted)}
                  >
                    Comenzar gratis
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-12 flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row"
            style={{ borderTop: `1px solid ${notion.divider}` }}
          >
            <p className="text-sm" style={{ color: notion.inkFaint }}>
              © 2026 HotelApp. Todos los derechos reservados. Un producto de{" "}
              <a
                href="https://zenlorlabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors"
                style={{ color: notion.inkMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = viz.series1)}
                onMouseLeave={(e) => (e.currentTarget.style.color = notion.inkMuted)}
              >
                Zenlor Labs
              </a>
              .
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="landing-press text-sm transition-colors"
              style={{ color: notion.inkMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = notion.ink)}
              onMouseLeave={(e) => (e.currentTarget.style.color = notion.inkMuted)}
            >
              Volver arriba ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaginaPrincipal;
