import docx from '../assets/icons/docx-file.png';
import pdf from '../assets/icons/pdf.png';
import video from '../assets/icons/play.png';
import music from '../assets/icons/music.png';
import zip from '../assets/icons/zip.png';
import file from '../assets/icons/file.png';
import image from '../assets/icons/file.png'; 
import code from '../assets/icons/code.png';

export const FileTypeIcon = {
	doc: docx,
	docx: docx,
	txt: docx,
	rtf: docx,
	odt: docx,

	xls: docx,
	xlsx: docx,
	csv: docx,

	ppt: docx,
	pptx: docx,

	pdf: pdf,

	jpg: image,
	jpeg: image,
	png: image,
	gif: image,
	webp: image,
	svg: image,
	bmp: image,

	mp4: video,
	mkv: video,
	avi: video,
	mov: video,
	webm: video,
	flv: video,

	mp3: music,
	wav: music,
	ogg: music,
	m4a: music,
	flac: music,

	zip: zip,
	rar: zip,
	tar: zip,
	gz: zip,

	js: code,
	ts: code,
	json: code,
	html: code,
	css: code,
	py: code,
	java: code,
	cpp: code,
	c: code,

	// fallback
	default: file,
};
