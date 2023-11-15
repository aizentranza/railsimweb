# encoding: utf-8
input_path  = "index.html"
output_path = "RailSimWeb.html"
$unite = ""
def put_line(line)
  $unite += line
end
def dump_file(f_path)
  print ", #{f_path}"
  put_line(File.read(f_path, encoding: "UTF-8"))
end
print "read file: #{input_path}"
File.foreach(input_path, encoding: "UTF-8"){|line|
  if line =~ /( *)(<link rel="stylesheet" href="(.*)" \/>)/
    indent = Regexp.last_match[1]
    f_line = Regexp.last_match[2]
    f_path = Regexp.last_match[3]
    put_line("#{indent}<!-- #{f_line} -->\n")
    put_line("#{indent}<style type=\"text/css\">\n")
    dump_file(f_path)
    put_line("#{indent}</style>\n")
  elsif line =~ /( *)(<script src="(.*)"><\/script>)/
    indent = Regexp.last_match[1]
    f_line = Regexp.last_match[2]
    f_path = Regexp.last_match[3]
    put_line("#{indent}<!-- #{f_line} -->\n")
    put_line("#{indent}<script>\n")
    dump_file(f_path)
    put_line("#{indent}</script>\n")
  else
    put_line(line)
 end
}
print "\n"
print "write file: #{output_path}\n"
File.open(output_path, mode = "w"){|f|
  f.write($unite)
}
