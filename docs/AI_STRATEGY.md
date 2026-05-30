# AI Strategy & Integration (Groq)

## 1. Mengapa Groq?
Momentum menggunakan **Groq** dengan model `llama3-8b-8192` (atau 70B) karena:
- **Kecepatan Inferensi Ekstrem**: Mencapai 800+ tokens per detik, membuat fitur AI terasa instan (cocok dengan *Optimistic UI mindset* proyek ini).
- **Cost-Effective**: Sangat murah atau gratis (via API Key gratis) untuk micro-SaaS MVP.

## 2. Fitur: "Weekly Consistency Insights"
Alih-alih menyuruh user chatting dengan bot (yang membosankan), Momentum akan memberikan *Insights* yang generatif dan proaktif.

### Alur Kerja (Data Pipeline)
1. User menekan tombol "Generate Insight".
2. Backend melakukan *query* ke database `habit_logs` untuk 7 hari terakhir.
3. Backend menyusun data log tersebut menjadi format JSON atau teks sederhana.
   - *Contoh data*: "Habit 'Olahraga' 2/7 hari selesai. Habit 'Membaca' 7/7 hari selesai."
4. Data dikirim ke API Groq menggunakan *System Prompt* khusus.
5. Groq merespon dengan 1-2 kalimat motivasi atau saran perbaikan.

## 3. System Prompt Design
```text
"Kamu adalah Momentum, asisten produktivitas berbasis psikologi perilaku (behavioral psychology). 
Tugasmu adalah menganalisis data tracking kebiasaan mingguan dari pengguna dan memberikan 1 paragraf feedback yang sangat ringkas, menohok, namun memotivasi (Dopamine-driven).
Jika user konsisten, berikan apresiasi tinggi. Jika user sering bolong, berikan 'tough love' dan saran praktis (misal: kaitkan dengan rutinitas harian).
Jangan gunakan bahasa formal yang kaku, gunakan bahasa kasual, suportif, ala startup modern."
```

## 4. Manajemen Biaya & Rate Limiting
- **Token Optimization**: Data log yang dikirim harus sangat di-kompres. Jangan kirim struktur objek kompleks, ubah menjadi *string summary*.
- **Caching**: Simpan hasil *insight* mingguan di *database* atau *localStorage*. Jangan hit API Groq setiap kali user *refresh* halaman. AI hanya men-generate ulang jika minggu telah berganti atau user secara manual menekan tombol "Regenerate".
