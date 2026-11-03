# Reserva de entradas de cine

**Estado:** aprobada
**Dominio:** cartelera y reservas

## Contexto

Un cine con varias salas publica su cartelera y vende entradas por función. El cliente
elige butacas concretas; no hay pago en línea en esta iteración. El personal administra
películas, salas y funciones desde el admin de Django.

## Requisitos

- **R1:** el catálogo (`películas`, `funciones`) es público y de solo lectura.
- **R2:** una sala define su tamaño con `rows` × `seats_per_row`; una butaca es un par `(row, number)` dentro de esos límites.
- **R3:** cada función tiene película, sala, fecha/hora y precio; no puede haber dos funciones en la misma sala a la misma hora.
- **R4:** `GET /api/v1/screenings/{id}/seats/` devuelve el tamaño de la sala y las butacas ocupadas.
- **R5:** `POST /api/v1/reservations/` con `{screening, seats:[{row, number}]}` crea una reserva confirmada con código único y total calculado.
- **R6:** una butaca ocupada no se puede reservar dos veces, ni siquiera con peticiones simultáneas.
- **R7:** solo el dueño ve y cancela sus reservas.
- **R8:** cancelar libera las butacas y conserva el histórico de la reserva.

## Criterios de aceptación

- [x] El listado de funciones omite las que ya empezaron.
- [x] `seats_available` refleja capacidad menos butacas activas.
- [x] Reservar 2 butacas de 6,50 € devuelve `total` 13,00 y un `code`.
- [x] Repetir la misma butaca en la petición devuelve `400` con `fields.seats`.
- [x] Pedir una butaca fuera de la sala devuelve `400`.
- [x] Reservar una butaca ya ocupada devuelve `409`.
- [x] Reservar en una función pasada devuelve `400`.
- [x] Sin token, `POST /api/v1/reservations/` devuelve `401`.
- [x] Un usuario no ve reservas de otro ni puede cancelarlas (`404`).
- [x] Tras cancelar, la butaca aparece libre y se puede volver a reservar.
- [x] Cancelar dos veces la misma reserva devuelve `400`.

## Fuera de alcance

- Pago, facturación y reembolsos.
- Descuentos, tarifas por tipo de entrada y butacas VIP.
- Reserva temporal con expiración (los asientos se ocupan al confirmar).
- Notificaciones por email o QR de acceso.

## Restricciones

- Un solo cine; varias salas.
- Sin `SELECT FOR UPDATE` sobre la sala: la garantía es un índice único parcial en base de datos.
- El precio se congela en la reserva: cambiar el precio de la función no altera reservas pasadas.
- Toda la escritura ocurre dentro de una transacción.
- No se puede reservar una función ya comenzada.
