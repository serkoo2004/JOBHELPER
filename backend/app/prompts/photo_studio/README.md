# Photo Studio Prompts

Bu klasor, Assets ekranindaki portre/studio uretim promptlarini tutmak icin ayrildi.

Kullanim plani:

- Kullanici prompt textlerini paylasir.
- Her prompt temiz bir Markdown dosyasina donusturulur.
- Dosyalar template, stil ve kalite kurallari ile bolumlenir.
- Backend daha sonra bu promptlari AI image pipeline tarafinda kullanacak sekilde baglanabilir.

Onerilen dosya yapisi:

- `corporate-headshot-dark-gray.md`
- `formal-cv-portrait-soft-gray.md`
- `formal-id-style-gray.md`
- `executive-navy-studio.md`
- `creative-black-turtleneck.md`
- `tech-founder-henley.md`
- `healthcare-white-coat.md`
- `academic-tweed-consultant.md`
- `sales-client-facing.md`

Her dosyada su bolumler tutulacak:

- `Intent`
- `Prompt`
- `Negative Prompt`
- `Identity Preservation`
- `Lighting`
- `Background`
- `Output Rules`
