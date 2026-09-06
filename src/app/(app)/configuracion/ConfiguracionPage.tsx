'use client';
import React, { useEffect, useState } from 'react';
import { Spin, Alert, message, Input, InputNumber, Button, Upload, Avatar, Switch, Popconfirm } from 'antd';
import type { UploadProps } from 'antd';
import { Hotel, MapPin, Phone, Mail, Save, ImageUp, Globe, Building2, Copy, RefreshCw, KeyRound } from 'lucide-react';
import ConfiguracionService, { Configuracion } from '@/services/ConfiguracionService';
import { notion } from '@/lib/theme';
import { PageHeader } from '@/components/ui/PageHeader';
import { Section } from '@/components/ui/Section';

interface ConfiguracionPageProps {
  token: string;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

const ConfiguracionPage: React.FC<ConfiguracionPageProps> = ({ token }) => {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [nombreHotel, setNombreHotel] = useState('');
  const [porcentajeIva, setPorcentajeIva] = useState<number>(0);
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [reservasNativasActivas, setReservasNativasActivas] = useState(true);
  const [reservasLibresActivas, setReservasLibresActivas] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [regenerando, setRegenerando] = useState(false);

  useEffect(() => {
    if (!token) return;
    ConfiguracionService.getConfiguracion(token)
      .then((data) => {
        setConfig(data);
        setNombreHotel(data.nombre_hotel ?? '');
        setPorcentajeIva(Number(data.porcentaje_iva ?? 0));
        setDireccion(data.direccion ?? '');
        setTelefono(data.telefono ?? '');
        setCorreo(data.correo ?? '');
        setReservasNativasActivas(Boolean(data.reservas_nativas_activas ?? true));
        setReservasLibresActivas(Boolean(data.reservas_libres_activas ?? false));
      })
      .catch(() => setError('Error al obtener la configuración'))
      .finally(() => setLoading(false));
  }, [token]);

  // Carga la api key bajo demanda (solo cuando el canal está activo) y solo una vez;
  // si el usuario no es admin el backend responde 401 y simplemente no se muestra la sección.
  useEffect(() => {
    if (!token || !reservasLibresActivas || apiKey || apiKeyLoading || apiKeyError) return;
    setApiKeyLoading(true);
    ConfiguracionService.getReservasLibresApiKey(token)
      .then(setApiKey)
      .catch(() => setApiKeyError(true))
      .finally(() => setApiKeyLoading(false));
  }, [token, reservasLibresActivas, apiKey, apiKeyLoading, apiKeyError]);

  const handleCopiarApiKey = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      message.success('Api key copiada');
    } catch {
      message.error('No se pudo copiar la api key');
    }
  };

  const handleRegenerarApiKey = async () => {
    setRegenerando(true);
    try {
      const nueva = await ConfiguracionService.regenerarReservasLibresApiKey(token);
      setApiKey(nueva);
      message.success('Api key regenerada: actualízala en la página externa');
    } catch (error: any) {
      message.error(error?.message ?? 'Error al regenerar la api key');
    } finally {
      setRegenerando(false);
    }
  };

  const handleSeleccionarLogo: UploadProps['beforeUpload'] = (file) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
    return false; // no subir automáticamente: se envía junto con "Guardar cambios"
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const actualizado = await ConfiguracionService.updateConfiguracion(
        token,
        {
          nombre_hotel: nombreHotel,
          porcentaje_iva: porcentajeIva,
          direccion,
          telefono,
          correo,
          reservas_nativas_activas: reservasNativasActivas,
          reservas_libres_activas: reservasLibresActivas,
        },
        logoFile
      );
      setConfig(actualizado);
      setLogoFile(null);
      setLogoPreview(null);
      message.success('Configuración actualizada');
    } catch (error: any) {
      message.error(error?.message ?? 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const logoActual = logoPreview ?? (config?.logo_url ? `${backendUrl}${config.logo_url}` : null);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <PageHeader title="Configuración" subtitle="Marca del hotel, IVA y datos que aparecen en las facturas" />

      <Section title="Marca">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Avatar
            shape="square"
            size={64}
            src={logoActual ?? undefined}
            style={{ background: notion.divider, flexShrink: 0 }}
            icon={!logoActual ? <Hotel size={26} /> : undefined}
          />
          <Upload accept="image/png,image/jpeg,image/webp,image/svg+xml" showUploadList={false} beforeUpload={handleSeleccionarLogo}>
            <Button icon={<ImageUp size={14} />}>Cambiar logo</Button>
          </Upload>
        </div>

        <label style={{ fontSize: 13, color: notion.inkMuted, display: 'block', marginBottom: 6 }}>Nombre del hotel</label>
        <Input
          size="large"
          prefix={<Hotel size={14} color={notion.inkFaint} />}
          placeholder="HotelApp"
          value={nombreHotel}
          onChange={(e) => setNombreHotel(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </Section>

      <Section title="Facturación">
        <label style={{ fontSize: 13, color: notion.inkMuted, display: 'block', marginBottom: 6 }}>Porcentaje de IVA</label>
        <InputNumber
          size="large"
          min={0}
          max={100}
          addonAfter="%"
          value={porcentajeIva}
          onChange={(v) => setPorcentajeIva(Number(v) || 0)}
          style={{ width: 160, marginBottom: 16 }}
        />
        <div style={{ fontSize: 12.5, color: notion.inkFaint, marginTop: -10, marginBottom: 16 }}>
          Se aplica automáticamente a las facturas que se generan al hacer check-out.
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: notion.inkMuted, display: 'block', marginBottom: 6 }}>Teléfono</label>
            <Input
              prefix={<Phone size={14} color={notion.inkFaint} />}
              placeholder="0999999999"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: notion.inkMuted, display: 'block', marginBottom: 6 }}>Correo</label>
            <Input
              prefix={<Mail size={14} color={notion.inkFaint} />}
              placeholder="contacto@hotel.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
        </div>

        <label style={{ fontSize: 13, color: notion.inkMuted, display: 'block', marginTop: 16, marginBottom: 6 }}>Dirección</label>
        <Input
          prefix={<MapPin size={14} color={notion.inkFaint} />}
          placeholder="Av. Amazonas N11-92"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </Section>

      <Section title="Canales de reservas">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${notion.divider}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={16} color={notion.inkFaint} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: notion.ink }}>Reservas nativas</div>
              <div style={{ fontSize: 12, color: notion.inkFaint }}>Reservas contra las habitaciones y disponibilidad reales del hotel</div>
            </div>
          </div>
          <Switch checked={reservasNativasActivas} onChange={setReservasNativasActivas} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: reservasLibresActivas && !apiKeyError ? `1px solid ${notion.divider}` : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={16} color={notion.inkFaint} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: notion.ink }}>Reservas libres (catálogos externos)</div>
              <div style={{ fontSize: 12, color: notion.inkFaint }}>Reservas que llegan de páginas externas; se revisan manualmente y nunca ocupan una habitación por sí solas</div>
            </div>
          </div>
          <Switch checked={reservasLibresActivas} onChange={setReservasLibresActivas} />
        </div>

        {reservasLibresActivas && !apiKeyError && (
          <div style={{ padding: '12px 0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <KeyRound size={14} color={notion.inkFaint} />
              <span style={{ fontSize: 13, fontWeight: 500, color: notion.ink }}>Api key de ingesta externa</span>
            </div>
            <div style={{ fontSize: 12, color: notion.inkFaint, marginBottom: 10 }}>
              Va en el header <code>x-api-key</code> de la página externa al llamar <code>POST /reservas-libres/ingest</code>.
            </div>
            {apiKeyLoading && !apiKey ? (
              <Spin size="small" />
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Input readOnly value={apiKey ?? ''} style={{ fontFamily: 'monospace', fontSize: 12.5 }} />
                <Button icon={<Copy size={14} />} onClick={handleCopiarApiKey} disabled={!apiKey} title="Copiar" />
                <Popconfirm
                  title="¿Regenerar la api key?"
                  description="La key anterior deja de funcionar de inmediato: tendrás que actualizarla en la página externa."
                  okText="Regenerar"
                  okButtonProps={{ danger: true }}
                  onConfirm={handleRegenerarApiKey}
                >
                  <Button icon={<RefreshCw size={14} />} loading={regenerando}>
                    Regenerar
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>
        )}
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button type="primary" size="large" icon={<Save size={16} />} loading={saving} onClick={handleGuardar}>
          Guardar cambios
        </Button>
      </div>
    </div>
  );
};

export default ConfiguracionPage;
