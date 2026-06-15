---
name: domain-modelo-inmobiliario
description: Real-estate pre-sale domain model the showroom must capture
metadata:
  node_type: memory
  type: reference
  originSessionId: aea19027-6cde-4cde-bdc2-edc0b2500667
---

Modelo de dominio de preventa inmobiliaria (LATAM) que la plataforma [[project-showroom-inmobiliario]] debe modelar:

**Jerarquía del producto:** Desarrollo/Proyecto → Etapa/Fase → Torre/Edificio → Piso/Nivel → **Unidad** (lo vendible: departamento, cochera, baulera).

**Unidad (entidad central):** tipología (monoambiente/1/2/3 dorm; comparte plano/render), m² cubiertos/semicubiertos/descubiertos (importante en LATAM, no un solo número), orientación (N/S/E/O), vista (frente/contrafrente/al río — afecta precio), estado comercial (disponible·reservada·señada·vendida·bloqueada), precio (frecuentemente USD o indexado) con plan de pagos.

**Factor que convierte demo en producto:** disponibilidad en tiempo real — al marcar vendida una unidad, el showroom público lo refleja al instante. Sincroniza "lo que ve el cliente" con "lo que maneja ventas".

**Embudo de preventa:** Lead → Reserva (monto chico, congela la unidad X días) → Seña/Boleto (anticipo + contrato preliminar) → Plan de pagos (anticipo % + cuotas + saldo a la entrega) → Escritura (al entregar la obra).

**Roles:** Admin/Desarrolladora (carga todo) · Broker/Vendedor (ve disponibilidad, reserva, maneja SUS leads) · Cliente/Público (explora, ve disponibilidad/precio, pide info).
