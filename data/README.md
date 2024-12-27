=====================================================================
# USAGE
=====================================================================

=====================================================================
# APA HEADINGS
https://writingcenter.uci.edu/2024/05/18/incorporating-headings-subheadings/
https://www.apaword.com/picture-in-apa-format.html
=====================================================================

DATA FORMAT IN DESC[] IN DOCS and FAMILY

ID	Type 			Detail																					Example

apa1|Results
apa2|Spatial Ability
apa3|Test One
apa4|Teachers with Training
apa5|Teacher Assistants

image|number|title|name|notes
document|title|name|notes

popup|start|title
	apa1|Results
	image|number|title|name|notes
popup|end

family|start|title
	w,h,s,d|name
family|end

NEW-PAGE
NODE-COUNT|Tổng số hệ
GEN-TABLE|Bảng tóm tắt hệ
TODAY|Hôm nay
MEMORIAL|Giỗ hôm nay
VIEW-NODES|Xem tất cả hệ
SEARCH-NODES|Tìm hệ
VIEW-TREE-ROOT|Xem phả đồ từ gốc
VIEW-TREE-NODES|Xem phả đồ theo nhánh|Phan Dính (Đời 7)








te	Text			align: left (al), center(ac), right(ar)					"te|ac|2|b|Nội dung"
							size: 1 (large), 2 (normal), 3 (small)
							style: b (bold), i (italic), u (underline)
							text: content

im	Image 		align: left (al), center(ac), right(ar)	 				"im|ac|2|Nhà Thờ Phan Tộc.png|Đá Bạc, Quảng Bình"
							size: 1 (large), 2 (normal), 3 (small)
							image: *.png, *.jpg
							caption: text

do	Document 	align: left (al), center(ac), right(ar)	 				"do|ar|Quảng Bình.doc|Bản đồ thế kỷ 19"
							file: *.doc, *.pdf
							caption: text

vi	Video		 	align: left (al), center(ac), right(ar)	 				"vi|ac|cai.mp4|Sông Cái, Nha Trang"
							file: *.mp4
							caption: text

rs	Relation	relation start "rs|header"											"rs|Quan hệ"
							w		Wife			name																"w|Phan Thi Vo",
							h		Husband		name						
							s		sond			name								
							d		doughter	name								
re	Relation	relation end	"re"															"re"

ps	Popup			popup start	"po|topics" 												"po|Tài liệu phả ký"
																																Hello
																																do|ar|Quảng Bình.doc|Bản đồ thế kỷ 19
																																im|ac|2|Bài vị Thủy Tổ.jpg|Bài vị Thủy Tổ, Nhà thờ Phan Tộc
pe	Popup			popup end	"po" 																	"pe"

NEW-PAGE					add page																		NEW-PAGE

[NODE-COUNT]  tổng số hệ													  					NODE-COUNT|Tổng số hệ
[GEN-TABLE]		Bảng tóm tắt hệ																	GEN-TABLE|Bảng tóm tắt hệ
[TODAY]				Hôm nay																					TODAY|Hôm nay
[MEMORIAL]		Giỗ hôm nay																			MEMORIAL|Giỗ hôm nay

[VIEW-NODES]	Xem tất cả hệ																		VIEW-NODES|Xem tất cả hệ
[SEARCH-NODES]	Tìm hệ																				SEARCH-NODES|Tìm hệ
[VIEW-TREE-ROOT]	Xem phả đồ từ gốc														VIEW-TREE-ROOT|Xem phả đồ từ gốc
[VIEW-TREE-NODES]	Xem phả đồ theo nhánh												VIEW-TREE-NODES|Xem phả đồ theo nhánh


