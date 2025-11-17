#!/bin/bash
CLOUD_NAME="dqy71jbij"
API_KEY="411914714957736"
UPLOAD_PRESET="bauchi-coops"

echo "Creating test PDF..."
cat > test.pdf << 'PDFEOF'
%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
185
%%EOF
PDFEOF

echo "Test 1: Upload with preset..."
curl -v -X POST "https://api.cloudinary.com/v1_1/$CLOUD_NAME/auto/upload" \
  -F "file=@test.pdf" \
  -F "upload_preset=$UPLOAD_PRESET" \
  -F "folder=bauchi_coops_documents/test" 2>&1 | grep -E "< HTTP|error|message" | head -20

rm -f test.pdf
