# Propuesta TP DSW

## Grupo
### Integrantes
* 52292 - Gonzales Díaz, Mauricio Renzo
* 52159 - Montaña, Tomás
* 53240 - Tobarez, Ariadna 

### Repositorios
* [Fullstack app](https://github.com/mauriciogonzales98/gestion-gastos-fork)

## Tema
### Descripción
Sistema de registro de gastos. El usuario puede registrar sus gastos e ingresos de dinero, la fuente y categorizarlos. Crear sus propias categorias y ver un resumen de sus gastos y un deglose por categorías de cuánto se ha gastado en cada una en un determinado período de tiempo.

### Modelo
<img width="4400" height="4396" alt="image" src="https://github.com/user-attachments/assets/efe1037e-8b41-4b8a-bf8f-2a317ba36b19" />






## Alcance Funcional 

### Alcance Mínimo 

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Categoría<br>3. CRUD Método de Pago<br>|
|CRUD dependiente|1. CRUD Wallet {depende de} CRUD Usuario<br>2. CRUD Movimiento {depende de} CRUD Wallet<br>3. CRUD Notificación {depende de} CRUD Movimiento|
|Listado<br>+<br>detalle| 1. Listado de gastos filtrado por categoría, muestra total de dinero gastado en cada categoría => detalle CRUD Gasto<br>|
|CUU/Epic|1. Registrar movimiento<br>2. Importar Movimientos<br>3. Crear Wallet<br>|

Aprobacion directa:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Categoría<br>3. CRUD Método de pago<br>|
|CRUD dependiente|1. CRUD Wallet {depende de} CRUD Usuario<br>2. CRUD Movimiento {depende de} CRUD Wallet<br>3. CRUD Notificación {depende de} CRUD Movimiento|
|Listado<br>+<br>detalle| 1. Listado de gastos filtrado por categoría, muestra total de dinero gastado en cada categoría => detalle CRUD Gasto<br> 2. Listado de movimientos filtrados por tipo => detalle CRUD Movimiento|
|CUU/Epic|1. Registrar movimiento<br>2. Importar Movimientos<br>3. Crear Wallet<br> 4. Enviar notificación de gasto fijo|
