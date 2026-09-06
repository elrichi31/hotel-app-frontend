"use client";
import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import {
  PanelLeft,
  Activity,
  Bell,
  Sun,
  Palette,
  Hotel,
  Search,
  Package,
  Monitor,
  PieChart,
  User,
  LogOut,
  Users,
  Store,
  FileText,
  CalendarClock,
  IdCard,
  Settings,
} from 'lucide-react';
import type { MenuProps } from 'antd';
import { Menu, Avatar, Layout, Drawer, Dropdown, Tooltip, Badge, Popover, message, Input } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import { notion, viz } from '@/lib/theme';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

type NavEntry = { key: string; label: string; icon: ReactNode; adminOnly?: boolean };

/** Navegación agrupada por secciones, al estilo de las carpetas de Notion. */
const NAV_SECTIONS: { title: string; entries: NavEntry[] }[] = [
  {
    title: 'Operación',
    entries: [
      { key: '/dashboard', label: 'Dashboard', icon: <PieChart size={16} /> },
      { key: '/nueva-venta', label: 'Nueva Venta', icon: <Store size={16} /> },
      { key: '/habitaciones', label: 'Habitaciones', icon: <Monitor size={16} /> },
    ],
  },
  {
    title: 'Registros',
    entries: [
      { key: '/ventas', label: 'Ventas', icon: <Package size={16} /> },
      { key: '/ventas/facturas', label: 'Facturas', icon: <FileText size={16} /> },
      { key: '/reservas', label: 'Reservas', icon: <CalendarClock size={16} /> },
      { key: '/clientes', label: 'Clientes', icon: <IdCard size={16} /> },
    ],
  },
  {
    title: 'Administración',
    entries: [
      { key: '/usuarios', label: 'Usuarios', icon: <Users size={16} />, adminOnly: true },
      { key: '/configuracion', label: 'Configuración', icon: <Settings size={16} />, adminOnly: true },
    ],
  },
];

const SIDER_WIDTH = 240;
const SIDER_COLLAPSED_WIDTH = 60;
const TOPBAR_HEIGHT = 60;
const TOPBAR_SIDE_PADDING = 12;
/** Alto del header del sidebar: coincide con el borde inferior de la tarjeta flotante de la derecha
 *  (que tiene TOPBAR_SIDE_PADDING de aire arriba), aunque el header del sidebar vaya pegado sin aire propio. */
const SIDEBAR_HEADER_HEIGHT = TOPBAR_HEIGHT + TOPBAR_SIDE_PADDING;
const COLLAPSE_KEY = 'hotelapp:sidebar-collapsed';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

const App = ({ children, user, logout, config }: any) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // react-responsive evalúa a `false` durante el SSR; esperamos al montaje para
  // no pintar el layout de escritorio y saltar luego al de móvil.
  // Se lee tambien la preferencia de colapso guardada (localStorage no existe en SSR).
  useEffect(() => {
    setMounted(true);
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      /* almacenamiento bloqueado: se queda expandido */
    }
  }, []);

  /** Cambia el colapso recordando la preferencia entre recargas, como hace Notion. */
  const applyCollapsed = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
    } catch {
      /* almacenamiento bloqueado: el cambio solo dura la sesion */
    }
  };

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const mobile = mounted && isMobile;

  const isAdmin = user?.role === 'admin';

  /** La ruta más específica que coincide con la URL actual (/ventas vs /ventas/facturas). */
  const selectedKey = useMemo(() => {
    const all = NAV_SECTIONS.flatMap((s) => s.entries)
      .filter((e) => !e.adminOnly || isAdmin)
      .map((e) => e.key);
    const matches = all.filter((k) => pathname === k || pathname?.startsWith(k + '/'));
    return matches.sort((a, b) => b.length - a.length)[0] ?? '';
  }, [pathname, isAdmin]);

  const navigate = (key: string) => {
    router.push(key);
    setDrawerVisible(false);
  };

  /** Agrupado cuando hay espacio; lista plana cuando está colapsado. */
  const buildItems = (grouped: boolean): MenuItem[] =>
    NAV_SECTIONS.flatMap<MenuItem>((section) => {
      const entries = section.entries.filter((e) => !e.adminOnly || isAdmin);
      if (entries.length === 0) return [];
      const children = entries.map((e) => ({
        key: e.key,
        icon: e.icon,
        label: e.label,
        onClick: () => navigate(e.key),
      }));
      return grouped
        ? [{ key: section.title, type: 'group' as const, label: section.title, children }]
        : children;
    });

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: (
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ color: notion.ink }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ fontSize: 12, color: notion.inkFaint }}>{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    { key: 'logout', icon: <LogOut size={16} />, label: 'Cerrar sesión', onClick: logout },
  ];

  const initials = ((user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? '')).toUpperCase();
  const iconProps = { size: 17, strokeWidth: 1.75 };
  const leftColumnWidth = mobile ? undefined : collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH;

  /** Header del sidebar: continuo con el resto (mismo fondo, sin radio ni borde propio),
   *  solo separado por una línea inferior, igual que cualquier otra sección. */
  const sidebarHeader = (
    <div
      style={{
        height: SIDEBAR_HEADER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        borderBottom: `1px solid ${notion.divider}`,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: config?.logo_url ? 'transparent' : viz.series1,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {config?.logo_url ? (
          <img
            src={`${backendUrl}${config.logo_url}`}
            alt={config.nombre_hotel ?? 'Logo'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Hotel size={16} strokeWidth={2} />
        )}
      </span>
      {!collapsed && (
        <div style={{ lineHeight: 1.25, overflow: 'hidden' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: notion.ink, whiteSpace: 'nowrap' }}>
            {config?.nombre_hotel ?? 'HotelApp'}
          </div>
          <div style={{ fontSize: 11.5, color: notion.inkFaint, whiteSpace: 'nowrap' }}>Panel de administración</div>
        </div>
      )}
    </div>
  );

  const sidebarBody = (grouped: boolean) => (
    <div className="flex flex-col h-full" style={{ background: notion.sidebarBg }}>
      {sidebarHeader}
      <div className="flex-1 overflow-y-auto overflow-x-hidden mt-2">
        {/* El colapso lo propaga el Sider por contexto; pasar `inlineCollapsed` aqui duplica el control. */}
        <Menu
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={buildItems(grouped)}
          style={{ borderInlineEnd: 'none', background: 'transparent' }}
        />
      </div>

      <div style={{ borderTop: '1px solid ' + notion.divider }} className="p-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors hover:bg-[rgba(55,53,47,0.06)]"
          style={{
            color: notion.inkMuted,
            fontSize: 14,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  /** Botón circular de ícono (trazo fino, estilo lucide): mismo tratamiento en todo el cluster de la derecha. */
  const IconButton = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) => (
    <Tooltip title={label}>
      <button
        onClick={onClick}
        aria-label={label}
        className="rounded-full transition-colors hover:bg-[rgba(255,255,255,0.06)]"
        style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: notion.inkMuted,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        {icon}
      </button>
    </Tooltip>
  );

  const soonMessage = (feature: string) => () => message.info(`${feature}: próximamente`);

  /** Cluster de acciones: actividad, notificaciones, apariencia y el avatar con menú. */
  const iconCluster = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <IconButton icon={<Activity {...iconProps} />} label="Actividad" onClick={() => router.push('/dashboard')} />
      <Popover
        trigger="click"
        placement="bottomRight"
        content={<span style={{ color: notion.inkMuted, fontSize: 13 }}>No tienes notificaciones nuevas</span>}
      >
        <button
          aria-label="Notificaciones"
          className="rounded-full transition-colors hover:bg-[rgba(255,255,255,0.06)]"
          style={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: notion.inkMuted,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <Badge dot color={viz.negative} offset={[-3, 3]}>
            <Bell {...iconProps} />
          </Badge>
        </button>
      </Popover>
      <IconButton icon={<Sun {...iconProps} />} label="Modo claro" onClick={soonMessage('Modo claro')} />
      <IconButton icon={<Palette {...iconProps} />} label="Apariencia" onClick={soonMessage('Personalizar apariencia')} />

      {user && (
        <Dropdown menu={{ items: userMenu }} trigger={['click']} placement="bottomRight">
          <div className="cursor-pointer" style={{ position: 'relative', marginInlineStart: 6, lineHeight: 0 }}>
            <Avatar shape="circle" size={32} style={{ background: notion.blue, color: '#fff', fontSize: 12 }}>
              {initials || 'H'}
            </Avatar>
            <span
              style={{
                position: 'absolute',
                right: -1,
                bottom: -1,
                width: 9,
                height: 9,
                borderRadius: 5,
                background: viz.positive,
                border: `2px solid ${notion.sidebarBg}`,
              }}
            />
          </div>
        </Dropdown>
      )}
    </div>
  );

  /** Barra flotante solo para móvil: abre el drawer + el mismo cluster de acciones,
   *  ya que no hay una columna de sidebar permanente para alojar el header. */
  const mobileBar = (
    <div
      style={{
        background: notion.sidebarBg,
        border: `1px solid ${notion.divider}`,
        borderRadius: 12,
        height: TOPBAR_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        flexShrink: 0,
        position: 'fixed',
        insetInlineStart: TOPBAR_SIDE_PADDING,
        insetInlineEnd: TOPBAR_SIDE_PADDING,
        top: TOPBAR_SIDE_PADDING,
        zIndex: 20,
      }}
    >
      <button
        onClick={() => setDrawerVisible(true)}
        aria-label="Abrir menú"
        className="rounded-md transition-colors hover:bg-[rgba(255,255,255,0.06)]"
        style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: notion.inkMuted,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <PanelLeft {...iconProps} />
      </button>
      {iconCluster}
    </div>
  );

  /** Tarjeta de utilidades: vive sobre la columna del contenido (solo escritorio). */
  const toolbarCard = (
    <div
      style={{
        background: notion.sidebarBg,
        border: `1px solid ${notion.divider}`,
        borderRadius: 12,
        height: TOPBAR_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '0 16px',
        flexShrink: 0,
        position: 'fixed',
        insetInlineStart: (leftColumnWidth ?? 0) + TOPBAR_SIDE_PADDING,
        insetInlineEnd: TOPBAR_SIDE_PADDING,
        top: TOPBAR_SIDE_PADDING,
        zIndex: 20,
        transition: 'inset-inline-start 0.2s',
      }}
    >
      <button
        onClick={() => applyCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
        className="transition-colors hover:bg-[rgba(255,255,255,0.06)]"
        style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: notion.inkMuted,
          border: `1px solid ${notion.divider}`,
          borderRadius: '50%',
          background: 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <PanelLeft {...iconProps} />
      </button>

      <Input
        prefix={<Search size={15} strokeWidth={1.75} color={notion.inkFaint} />}
        placeholder="Buscar..."
        suffix={<span style={{ fontSize: 11, color: notion.inkFaint }}>⌘K</span>}
        onPressEnter={soonMessage('Buscador')}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${notion.divider}`,
          borderRadius: 8,
          flex: 1,
          maxWidth: 360,
        }}
      />

      {iconCluster}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: notion.pageBg }}>
      {mobile && mobileBar}
      {!mobile && toolbarCard}

      {mobile ? (
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          closable={false}
          width={260}
          styles={{ body: { padding: 0, background: notion.sidebarBg } }}
        >
          {sidebarBody(true)}
        </Drawer>
      ) : (
        <Sider
          collapsed={collapsed}
          width={SIDER_WIDTH}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
          theme="light"
          style={{
            position: 'fixed',
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            height: '100vh',
            background: notion.sidebarBg,
            borderInlineEnd: `1px solid ${notion.divider}`,
            zIndex: 10,
          }}
        >
          {sidebarBody(!collapsed)}
        </Sider>
      )}

      <div
        style={{
          marginInlineStart: mobile ? 0 : collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH,
          marginTop: mobile ? TOPBAR_HEIGHT + TOPBAR_SIDE_PADDING * 2 : SIDEBAR_HEADER_HEIGHT,
          background: notion.contentBg,
          minHeight: mobile ? undefined : `calc(100vh - ${SIDEBAR_HEADER_HEIGHT}px)`,
          padding: mobile ? '20px 16px' : '32px 48px',
          transition: 'margin-inline-start 0.2s',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default App;
