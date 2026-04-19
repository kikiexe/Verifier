# [Performance] Migrasi Pencarian Event Logs ke Sistem Indexer (The Graph / Ponder)

## Latar Belakang Masalah
Saat ini, di dalam komponen atau halaman `AdminPage` (melalui hook `useAdmin.ts`), aplikasi mengekstrak data historis penerbit (Issuer) dengan melakukan pemindaian log *events* langsung (query filtering logs) ke node RPC blockchain sepotong-sepotong (per chunk 10.000 blok) sejak *deployment block* `38088367`.

**Snippet Kode Saat Ini:**
```typescript
const currentBlock = await provider.getBlockNumber();
const deploymentBlock = 38088367;
const CHUNK_SIZE = 10000;
const allEvents = [];

for (let fromBlock = deploymentBlock; fromBlock <= currentBlock; fromBlock += CHUNK_SIZE) {
  const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, currentBlock);
  const filter = registry.filters.IssuerAdded();
  const events = await registry.queryFilter(filter, fromBlock, toBlock);
  allEvents.push(...events);
}
```

## Analisis Masalah (Pain Points)
Meskipun untuk arsitektur *early-stage* pendekatan ini berfungsi dan logika *chunking* mencegah timeout *request* node, pendekatan ini gagal jika digunakan untuk jangka panjang (tidak *scalable*):
1. **Beban RPC Semakin Berat:** Semakin jauh usia blok berjalan, semakin banyak iterasi memanggil RPC. Ini berpotensi sangat tinggi menghabiskan limitasi per bulan langganan Alchemy.
2. **Kecepatan Memuat (Latency):** Waktu yang dibutuhkan agar list admin ter-render pada *Dashboard* akan melambat secara eksponensial seiring pertambahan blok (*fetching cascade*).
3. **Potensi Timeout Frontend:** Pemrosesan agregasi *array mapping* hasil riwayat *events* secara brutal pada peramban klien memakan memori CPU dan dapat mengakibatkan *bottleneck*. 

## Solusi yang Diusulkan
Kita harus mengalihdayakan logika pencarian sejarah peristiwa (*event indexing*) menjadi sebuah relasional database API yang efisien, melalui **Sistem Indexer Subgraph**.

### Rekomendasi Solusi Teknis
1. **Menggunakan "The Graph Protocol" (Standalone Subgraph / Studio)**
   - Membuat *schema.graphql* sederhana untuk mendengarkan (listen) *event* `IssuerAdded` dan `IssuerStatusChanged`.
   - Melakukan queri ke Endpoint GraphQL The Graph alih-alih `queryFilter` menggunakan Ethers v6.

   *(Opsi Alternatif)*
2. **Menggunakan "Ponder" / "Envio" (Modern Indexer Framework)**
   - Solusi *next-gen* pengganti The Graph yang bisa disematkan lebih cepat via TypeScript dan berjalan *local / docker* hingga *cloud deployment* dengan lebih ringan dan cepat secara *indexing time*.

## Rencana Eksekusi (Action Item)
- [ ] Riset dan pilih framework indexer yang paling sesuai dengan tumpukan (stack) proyek saat ini dan budget (The Graph / Ponder).
- [ ] Buat *indexer service* baru.
- [ ] Pasang *sync* *ABI* terhadap *Smart Contract* `IssuerRegistry`.
- [ ] Definisikan skema GraphQL untuk menyimpan data Issuer (`Address`, `Name`, `isActive`, `createdAt`).
- [ ] *Deploy* indexer ke *hosted service*.
- [ ] Refactor struktur `useAdmin.ts` di Frontend untuk *fetching* daftar Issuer (dan status aktifnya) hanya dengan satu panggilan `POST` berdasar GraphQL ke Endpoint URL Indexer dibandingkan memecah belah per blok RPC. 

## Kriteria Sukses (DoD)
- Fungsi pengambilan data Issuer tidak membebani provider Ethers/Wagmi via RPC Node pada Frontend.
- Waktu memuat awal `AdminPage` harus lebih rendah dari `500ms`, apa pun jarak *blocknumber* dari *SmartContract deployment*.
- Kueri dapat menerima parameter asertif (*sort*, *limit*, *pagination*).
