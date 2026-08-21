import sqlite3, hashlib, secrets, os
from pathlib import Path
root=Path(__file__).resolve().parent
path=root/'libratech.db'
if path.exists(): path.unlink()
con=sqlite3.connect(path)
con.executescript((root/'schema.sql').read_text())

def phash(password):
    salt=secrets.token_hex(16)
    h=hashlib.scrypt(password.encode(),salt=salt.encode(),n=16384,r=8,p=1,dklen=64)
    return salt+':'+h.hex()

courses=[
('BSIT','Bachelor of Science in Information Technology','IT/Computing'),('BSCS','Bachelor of Science in Computer Science','IT/Computing'),('BSIS','Bachelor of Science in Information Systems','IT/Computing'),('BSCpE','Bachelor of Science in Computer Engineering','Engineering'),('BSBA','Bachelor of Science in Business Administration','Business'),('BSA','Bachelor of Science in Accountancy','Business'),('BSMA','Bachelor of Science in Management Accounting','Business'),('BSHM','Bachelor of Science in Hospitality Management','Hospitality/Tourism'),('BSTM','Bachelor of Science in Tourism Management','Hospitality/Tourism'),('BSOA','Bachelor of Science in Office Administration','Business'),('BSPsych','Bachelor of Science in Psychology','Psychology/Social Sciences'),('BSEd','Bachelor of Science in Education','Education'),('BEEd','Bachelor of Elementary Education','Education'),('BSCrim','Bachelor of Science in Criminology','Criminology'),('BSN','Bachelor of Science in Nursing','Health'),('BSMLS','Bachelor of Science in Medical Laboratory Science','Health'),('BSCE','Bachelor of Science in Civil Engineering','Engineering'),('BSEE','Bachelor of Science in Electrical Engineering','Engineering'),('BSME','Bachelor of Science in Mechanical Engineering','Engineering'),('BSENTREP','Bachelor of Science in Entrepreneurship','Business'),('GENED','General Education','General Education'),('COMM','Communication','General Education'),('MATH','Mathematics','General Education'),('SCI','Sciences','General Education'),('HUM','Humanities','General Education'),('SOCSCI','Social Sciences','Social Sciences')]
con.executemany('INSERT INTO courses(code,name,field_group) VALUES(?,?,?)',courses)
sections=['1A','1B','1C','2A','2B','2C','3A','3B','3C','4A','4B','4C']
for cid, in con.execute('SELECT id FROM courses'):
    con.executemany('INSERT INTO sections(course_id,name) VALUES(?,?)',[(cid,s) for s in sections])
con.execute('INSERT INTO users(full_name,username,password_hash,role,account_status) VALUES(?,?,?,?,?)',('LibraTech Owner','owner',phash('12345'),'owner','active'))
con.executemany('INSERT INTO system_settings(key,value) VALUES(?,?)',[('borrowing_days','7'),('borrowing_limit','3'),('owner_failed_attempts','0'),('owner_locked_until','')])
books=[
('BK-0001','9780135957059','Introduction to Programming','Tony Gaddis','Programming','IT/Computing','Pearson',2021,5,'Core programming concepts for beginners.',['BSIT','BSCS','BSIS','BSCpE']),
('BK-0002','9781260598668','System Analysis and Design','Shelly Cashman','Systems Analysis','IT/Computing','McGraw-Hill',2020,4,'Requirements, modeling, and system design.',['BSIT','BSIS','BSCS']),
('BK-0003','9780131873254','Database Management Systems','Raghu Ramakrishnan','Databases','IT/Computing','McGraw-Hill',2019,5,'Database concepts, SQL, and data modeling.',['BSIT','BSCS','BSIS','BSCpE']),
('BK-0004','9780134481265','Web Development Fundamentals','Jon Duckett','Web Development','IT/Computing','Wiley',2020,4,'Modern foundations of web development.',['BSIT','BSCS','BSIS']),
('BK-0005','9780135166307','Computer Networking','James Kurose','Networking','IT/Computing','Pearson',2021,3,'Networking principles and protocols.',['BSIT','BSCS','BSCpE','BSEE']),
('BK-0006','9780134610993','Artificial Intelligence Fundamentals','Tom Taulli','Artificial Intelligence','IT/Computing','CRC Press',2021,3,'Accessible introduction to AI concepts.',['BSIT','BSCS','BSIS','BSCpE']),
('BK-0007','9780136681557','Business Mathematics','Gary Clendenen','Mathematics','Business','Pearson',2022,6,'Mathematical tools for business decisions.',['BSBA','BSA','BSMA','BSENTREP']),
('BK-0008','9781260714785','Financial Accounting','Jerry Weygandt','Accounting','Business','McGraw-Hill',2021,5,'Fundamentals of financial accounting.',['BSA','BSMA','BSBA']),
('BK-0009','9780134492513','Principles of Marketing','Philip Kotler','Marketing','Business','Pearson',2020,4,'Core marketing principles and practice.',['BSBA','BSENTREP','BSHM','BSTM']),
('BK-0010','9781260834308','Entrepreneurship','Robert Hisrich','Entrepreneurship','Business','McGraw-Hill',2022,4,'Starting and managing entrepreneurial ventures.',['BSENTREP','BSBA']),
('BK-0011','9781119781088','Hotel Management','Alan Clarke','Hospitality Management','Hospitality/Tourism','Wiley',2021,4,'Hotel operations and management.',['BSHM','BSTM']),
('BK-0012','9780134783727','Tourism Management','Stephen Page','Tourism','Hospitality/Tourism','Pearson',2020,3,'Tourism planning, policy, and management.',['BSTM','BSHM']),
('BK-0013','9780135209294','Teaching Methods','Marianne Celce-Murcia','Education','Education','Pearson',2021,5,'Approaches to effective classroom teaching.',['BSEd','BEEd']),
('BK-0014','9780135177790','Educational Psychology','Anita Woolfolk','Educational Psychology','Education','Pearson',2020,4,'Learning and development in educational settings.',['BSEd','BEEd','BSPsych']),
('BK-0015','9781317701386','General Psychology','Ciccarelli White','Psychology','Psychology/Social Sciences','Pearson',2021,5,'Introduction to psychology and human behavior.',['BSPsych','BSEd','BEEd','BSN']),
('BK-0016','9781506386705','Research Methods','John Creswell','Research Methods','Social Sciences','SAGE',2018,4,'Research design and methodology across disciplines.',['BSPsych','BSEd','BSN','BSBA','BSIT']),
('BK-0017','9780323792912','Anatomy and Physiology','Kevin Patton','Anatomy','Health','Elsevier',2022,5,'Foundations of human anatomy and physiology.',['BSN','BSMLS']),
('BK-0018','9780323554732','Nutrition Essentials','Mary Grosvenor','Nutrition','Health','Elsevier',2021,4,'Nutrition science and wellness.',['BSN','BSMLS','BSHM']),
('BK-0019','9781260575577','Engineering Mathematics','John Bird','Engineering Mathematics','Engineering','McGraw-Hill',2020,5,'Mathematical methods for engineering.',['BSCE','BSEE','BSME','BSCpE']),
('BK-0020','9780134873738','Engineering Physics','Serway Jewett','Physics','Engineering','Cengage',2019,4,'Physics concepts and applications for engineering.',['BSCE','BSEE','BSME','BSCpE']),
('BK-0021','9780134846015','Criminal Investigation','Charles Swanson','Criminal Investigation','Criminology','McGraw-Hill',2020,4,'Principles and practices of criminal investigation.',['BSCrim']),
('BK-0022','9780134807610','Forensic Science','Richard Saferstein','Forensic Science','Criminology','Pearson',2019,3,'Introduction to forensic science.',['BSCrim','BSMLS']),
('BK-0023','9780199535581','Academic English','Michael Swan','English','General Education','Oxford',2020,5,'Academic English usage and communication.',['GENED','BSEd','BEEd','BSBA']),
('BK-0024','9789712360001','Filipino sa Iba’t Ibang Disiplina','Various','Filipino','General Education','Rex',2021,5,'Filipino language across disciplines.',['GENED','BSEd','BEEd']),
('BK-0025','9780134865122','Human-Computer Interaction','Alan Dix','HCI','IT/Computing','Pearson',2020,3,'Designing usable interactive systems.',['BSIT','BSCS','BSIS','BSENTREP'])]
for b in books:
    code,isbn,title,author,subject,cat,pub,yr,qty,desc,cc=b
    cur=con.execute('INSERT INTO books(book_code,isbn,title,author,subject_area,category,publisher,publication_year,quantity,available_copies,description) VALUES(?,?,?,?,?,?,?,?,?,?,?)',(code,isbn,title,author,subject,cat,pub,yr,qty,qty,desc))
    bid=cur.lastrowid
    for c in cc:
        cid=con.execute('SELECT id FROM courses WHERE code=?',(c,)).fetchone()[0]
        con.execute('INSERT INTO book_courses(book_id,course_id) VALUES(?,?)',(bid,cid))
con.commit()
# integrity checks
assert con.execute("SELECT COUNT(*) FROM users WHERE role='owner'").fetchone()[0]==1
assert con.execute('SELECT COUNT(*) FROM books').fetchone()[0]==25
assert con.execute('SELECT COUNT(*) FROM courses').fetchone()[0]==26
assert con.execute('PRAGMA foreign_key_check').fetchall()==[]
print(path)
print('owner:', con.execute("SELECT username FROM users WHERE role='owner'").fetchone()[0])
print('books:', con.execute('SELECT COUNT(*) FROM books').fetchone()[0])
print('clients:', con.execute("SELECT COUNT(*) FROM users WHERE role='client'").fetchone()[0])
