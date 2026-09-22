# Placestruct

Mały, w pełni lokalny generator czytelnych instrukcji krok po kroku, gotowych do druku (podgląd A4). Bez backendu, bez logowania — wszystko żyje w przeglądarce.

## Uruchomienie

Nie wymaga instalacji ani budowania. Wystarczy otworzyć `index.html` w przeglądarce.

## GitHub Pages

Wrzuć pliki `index.html`, `style.css` i `app.js` do repozytorium, a następnie w:
**Settings → Pages → Deploy from branch** wybierz główną gałąź (`main`).

## Funkcje

**Edycja treści**
- etykieta nad tytułem, tytuł, krótki opis instrukcji,
- dowolna liczba kroków, ze zmianą kolejności i możliwością zwijania/rozwijania (nowe kroki automatycznie zwijają poprzednie, żeby nie gubić się w długich instrukcjach),
- formatowanie tekstu opisu kroku: **pogrubienie**, *kursywa*, kolor tekstu (mały pasek narzędzi nad polem opisu).

**Zdjęcia**
- dowolna liczba zdjęć na krok — dodawanie przez przycisk, przeciągnięcie pliku albo wklejenie ze schowka (Ctrl+V) w dowolnym miejscu danego kroku,
- każde zdjęcie ma własny podpis i suwak rozmiaru (20–100%),
- zmiana kolejności zdjęć w obrębie kroku,
- układ wielu zdjęć do wyboru: jedno pod drugim albo obok siebie (siatka, maks. 3 w rzędzie, dopasowuje się do liczby zdjęć).

**Wyróżnienia**
- dowolna liczba wskazówek / uwag / informacji / ważnych na krok, każde z własnym typem i treścią.

**Wiele instrukcji**
- przycisk „Nowa” zapisuje bieżącą instrukcję i zwija ją na liście poprzednich, otwierając pusty formularz,
- lista zapisanych instrukcji: rozwijanie podglądu, edycja, usuwanie,
- „Wyczyść” czyści bieżący formularz w miejscu, bez archiwizowania.

**Podgląd i druk**
- podgląd A4 na żywo,
- tryb „Pojedyncza” (tylko edytowana instrukcja) albo „Wszystkie” (wszystkie zapisane instrukcje w jednym wydruku, każda od nowej strony),
- drukowanie przez przeglądarkę (Ctrl+P / przycisk „Drukuj”),
- każda instrukcja kończy się stopką z tytułem, ułatwiającą identyfikację kartek.

**Personalizacja wyglądu** (panel „🎨 Wygląd”)
- kolor i kształt numerków kroków (9 kształtów: kwadrat, zaokrąglony, koło, diament, sześciokąt, pięciokąt, ośmiokąt, gwiazda, trójkąt),
- rozmiar czcionki dokumentu,
- rozmiar wskazówek,
- układ wielu zdjęć (domyślny),
- tryb jasny / ciemny.

**Dane**
- wszystko zapisywane automatycznie w `localStorage` przeglądarki — czysto lokalnie, bez serwera i bez współdzielenia między urządzeniami/osobami.
