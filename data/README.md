=====================================================================
# USAGE
=====================================================================

=====================================================================
# HEADINGS
# https://pressbooks.bccampus.ca/technicalwriting/chapter/headings/#:~:text=Headings%20are%20standard%20features%20of,to%20scan%20and%20read%20selectively
# Level One Headings
First level headings should be the largest, and should be bolded. You might consider using ALL CAPS, but avoid this if the headings are long.
# Level Two Headings
Second level headings should be slightly smaller or in some way distinguished from first level headings. You might consider indenting the heading and aligning the subsequent blocks of text.
# Level Three Headings
Third level headings, if you use them should be further distinguished by smaller size, italicizing, and/or indenting them. And so on…
=====================================================================

DATA FORMAT

ID	Type 			Detail																	Example

0		Text			.viewer-home-container-text-1						"Hello world", "0|Hello world", 
		Normal		color: var(--app-color);
							font-size: var(--app-text-font-size-medium);

1		Heading		.viewer-home-container-text-2						"1|Tổ phụ", 
		Level 1		font-weight: bold;
							font-size: var(--app-text-font-size-large);

2		Heading		.viewer-home-container-text-3						"2|Tổ phụ", 
		Level 2		font-size: var(--app-text-font-size-medium);
							padding-left: 20%;

3		Heading		.viewer-home-container-text-4						"3|Tổ phụ", 
		Level 3		font-size: var(--app-text-font-size-small);
							padding-left: 40%;

im	Image 		align: left (al), center(ac), right(ar)	 "im|ac|2|Nhà Thờ Phan Tộc.png|Đá Bạc, Quảng Bình"
							size: 1 (large), 2 (normal), 3 (small)
							image: *.png, *.jpg
							caption: text

do	Document 	align: left (al), center(ac), right(ar)	 "do|ar|Quảng Bình.doc|Bản đồ thế kỷ 19"
							file: *.doc, *.pdf
							caption: text

vi	Video		 	align: left (al), center(ac), right(ar)	 "vi|ac|cai.mp4|Sông Cái, Nha Trang"
							file: *.mp4
							caption: text

w		Wife			name|detail																"w|Phan Thi Vo (|Mat ngay 12/04)",
h		Husband		name|detail																"h|Phan Van Dung (|Mat ngay 12/04)",
h		Son				name|detail																"s|Phan Van Dung (|Mat ngay 12/04)",
h		Daughter	name|detail																"d|Phan Thi Gai (|Mat ngay 12/04)",

"[START-POPUP]",
"Tài liệu phả ký",
"[CONTENT]",
"Hello",
"do|ar|Quảng Bình.doc|Bản đồ thế kỷ 19",
"im|ac|2|Bài vị Thủy Tổ.jpg|Bài vị Thủy Tổ, Nhà thờ Phan Tộc",
"[END-POPUP]"

[PAGE]				add page																	"[PAGE]"
[NODE-COUNT]  tổng số hệ													  		"[NODE-COUNT]"

[GEN-TABLE]		Bảng tóm tắt hệ														"[GEN-TABLE]"

[TODAY]				Hôm nay
[MEMORIAL]		Giỗ hôm nay

[[VIEW-NODES]]			Xem tất cả hệ
[[SEARCH-NODES]]		Tìm hệ
[[VIEW-TREE]]				Xem phả đồ theo Đời-Chi-Phái-Nhánh
[[VIEW-ROOT]]				Xem phả đồ theo Tổ phụ

